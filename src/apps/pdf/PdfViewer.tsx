import React, { useEffect, useRef, useState } from 'react';
import { DOCUMENTS, resolvePublicUrl, type DocumentId } from '../../config/portfolio';
import { deletePdf, listPdfs, savePdf, type StoredPdf } from '../../utils/pdfStore';
import { MenuBar, type MenuDef } from '../../components/xp/MenuBar';
import { PdfIcon } from '../../components/XpIcons';

const SELECTED_KEY = (id: DocumentId) => `xp-doc-selected-${id}`;
const MAX_BYTES = 25 * 1024 * 1024;

const formatSize = (bytes: number) =>
  bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/** "Adobe Reader 6"-style viewer with switchable published + uploaded PDF versions. */
export const PdfViewer: React.FC<{ docId: DocumentId; onClose: () => void }> = ({ docId, onClose }) => {
  const doc = DOCUMENTS[docId];
  const [uploads, setUploads] = useState<StoredPdf[]>([]);
  const [uploadsLoaded, setUploadsLoaded] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(() => {
    try {
      return localStorage.getItem(SELECTED_KEY(docId)) || doc.versions[0].id;
    } catch {
      return doc.versions[0].id;
    }
  });
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [missing, setMissing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const isTouch = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0 && window.innerWidth < 1024;

  useEffect(() => {
    let alive = true;
    listPdfs(docId)
      .then((list) => alive && setUploads(list))
      .catch(() => undefined)
      .finally(() => alive && setUploadsLoaded(true));
    return () => {
      alive = false;
    };
  }, [docId]);

  const published = doc.versions.find((v) => v.id === selectedId) ?? null;
  const upload = uploads.find((u) => u.id === selectedId) ?? null;

  useEffect(() => {
    if (uploadsLoaded && !published && !upload) setSelectedId(doc.versions[0].id);
  }, [uploadsLoaded, published, upload, doc.versions]);

  useEffect(() => {
    try {
      localStorage.setItem(SELECTED_KEY(docId), selectedId);
    } catch {
      /* ignore */
    }
  }, [docId, selectedId]);

  useEffect(() => {
    if (!upload) {
      setBlobUrl(null);
      return;
    }
    const url = URL.createObjectURL(upload.blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [upload]);

  const publishedUrl = published ? resolvePublicUrl(published.url) : null;

  useEffect(() => {
    if (!publishedUrl) {
      setMissing(false);
      return;
    }
    let alive = true;
    fetch(publishedUrl, { method: 'HEAD', cache: 'no-store' })
      .then((res) => {
        const type = res.headers.get('content-type') || '';
        // Only a 404, or an HTML page where a PDF should be, means the file is missing.
        if (alive) setMissing(res.status === 404 || type.includes('text/html'));
      })
      .catch(() => alive && setMissing(false));
    return () => {
      alive = false;
    };
  }, [publishedUrl]);

  const src = upload ? blobUrl : publishedUrl;
  const currentName = upload ? upload.name : doc.fileName;

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      setNotice('That file is not a PDF. Please choose a .pdf document.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setNotice('That PDF is larger than 25 MB.');
      return;
    }
    const saved = await savePdf(docId, file);
    setUploads((prev) => [saved, ...prev.filter((p) => p.id !== saved.id)]);
    setSelectedId(saved.id);
    setNotice(
      saved.sessionOnly
        ? `Opened “${file.name}” for this session (browser storage is unavailable).`
        : `Saved “${file.name}” in this browser. Switch versions anytime from the Version list.`
    );
  };

  const removeUpload = async () => {
    if (!upload) return;
    await deletePdf(upload.id);
    setUploads((prev) => prev.filter((p) => p.id !== upload.id));
    setSelectedId(doc.versions[0].id);
    setNotice(`Removed “${upload.name}”. Showing the published ${doc.fileName}.`);
  };

  const openInNewTab = () => {
    if (src) window.open(src, '_blank', 'noopener');
  };

  const menus: MenuDef[] = [
    {
      label: 'File',
      items: [
        { label: 'Open...', shortcut: 'Ctrl+O', onClick: () => fileRef.current?.click() },
        {
          label: 'Save a Copy...',
          disabled: !src,
          onClick: () => {
            if (!src) return;
            const a = document.createElement('a');
            a.href = src;
            a.download = currentName;
            a.click();
          },
        },
        { label: 'Open in New Tab', disabled: !src, onClick: openInNewTab },
        { separator: true },
        { label: 'Use Published Version', disabled: !upload, onClick: () => setSelectedId(doc.versions[0].id) },
        { label: 'Remove This Upload', disabled: !upload, onClick: removeUpload },
        { separator: true },
        { label: 'Close', onClick: onClose },
      ],
    },
    {
      label: 'View',
      items: [
        ...doc.versions.map((v) => ({ label: v.label, checked: v.id === selectedId, onClick: () => setSelectedId(v.id) })),
        ...(uploads.length ? [{ separator: true }] : []),
        ...uploads.map((u) => ({ label: `Uploaded: ${u.name}`, checked: u.id === selectedId, onClick: () => setSelectedId(u.id) })),
      ],
    },
    { label: 'Help', items: [{ label: 'How to update this PDF', onClick: () => setShowHelp(true) }] },
  ];

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragOver={(e) => {
        if (Array.from(e.dataTransfer.types).includes('Files')) {
          e.preventDefault();
          setDragOver(true);
        }
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      <MenuBar menus={menus} />

      <div className="xp-toolbar">
        <button type="button" className="xp-toolbar-btn" onClick={() => fileRef.current?.click()} title="Open a PDF from your computer">
          <span>📂</span> Open…
        </button>
        <a
          className="xp-toolbar-btn"
          href={src ?? undefined}
          download={currentName}
          aria-disabled={!src}
          title="Download this PDF"
        >
          <span>💾</span> Save a Copy
        </a>
        <button type="button" className="xp-toolbar-btn" onClick={openInNewTab} disabled={!src}>
          <span>↗</span> New Tab
        </button>
        <span className="xp-toolbar-sep" />
        <label className="flex items-center gap-1 text-[11px]">
          Version:
          <select
            className="xp-input max-w-[230px]"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <optgroup label="Published (repository)">
              {doc.versions.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </optgroup>
            {uploads.length > 0 && (
              <optgroup label="Uploaded in this browser">
                {uploads.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} · {new Date(u.addedAt).toLocaleDateString()}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
        {upload && (
          <button type="button" className="xp-toolbar-btn" onClick={removeUpload} title="Delete this uploaded version">
            ✖ Remove
          </button>
        )}
        <div className="flex-1" />
        <button type="button" className="xp-toolbar-btn" onClick={() => setShowHelp((v) => !v)}>
          ❔ How to update
        </button>
      </div>

      {showHelp && (
        <div className="flex items-start gap-2 border-b border-[#c9b96b] bg-[#ffffe1] px-3 py-2 text-[11px] leading-snug">
          <div className="flex-1">
            <b>Updating {doc.fileName}:</b> replace <code className="bg-white px-1">{doc.publicPath}</code> in the
            repository and redeploy — every visitor sees the new file. To offer several versions (e.g. SWE vs. research
            resume), add entries to <code className="bg-white px-1">DOCUMENTS.{docId}.versions</code> in{' '}
            <code className="bg-white px-1">src/config/portfolio.ts</code>. <b>File ▸ Open</b> or drag-and-drop previews
            any PDF instantly; uploads are stored only in this browser.
          </div>
          <button type="button" className="xp-btn" onClick={() => setShowHelp(false)}>
            OK
          </button>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 border-b border-[#9ec5ea] bg-[#e5f1fb] px-3 py-1.5 text-[11px]">
          <span className="flex-1">{notice}</span>
          <button type="button" className="text-[#0645ad] underline" onClick={() => setNotice(null)}>
            Dismiss
          </button>
        </div>
      )}

      <div className="relative min-h-0 flex-1 bg-[#525659]">
        {missing && !upload ? (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="max-w-[380px] rounded border border-[#7f9db9] bg-white p-5 text-center text-[11px] shadow-lg">
              <div className="mb-2 flex justify-center">
                <PdfIcon size={44} />
              </div>
              <div className="mb-1 text-[13px] font-bold text-[#0b3a9a]">{doc.fileName} hasn’t been published yet</div>
              <p className="mb-3 text-[#444]">
                The site looked for <code className="bg-[#f1f1f1] px-1 break-all">{publishedUrl}</code> and found nothing. Put
                the file at <code className="bg-[#f1f1f1] px-1">{doc.publicPath}</code> in the repo, or open a PDF from your
                computer to preview it here.
              </p>
              <button type="button" className="xp-btn xp-btn-primary" onClick={() => fileRef.current?.click()}>
                Open a PDF…
              </button>
            </div>
          </div>
        ) : src ? (
          <iframe key={src} src={`${src}#view=FitH`} title={currentName} className="absolute inset-0 h-full w-full border-0" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[12px] text-white">Loading document…</div>
        )}

        {isTouch && src && !missing && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center gap-2">
            <a href={src} target="_blank" rel="noreferrer" className="xp-btn xp-btn-primary shadow-lg">
              Open {currentName} ↗
            </a>
            <a href={src} download={currentName} className="xp-btn shadow-lg">
              Download
            </a>
          </div>
        )}

        {dragOver && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center border-4 border-dashed border-white bg-[#316ac5]/40 text-[15px] font-bold text-white">
            Drop a PDF to switch {doc.fileName}
          </div>
        )}
      </div>

      <div className="xp-statusbar">
        <div className="xp-statusbar__field flex-1">
          {upload
            ? `Viewing uploaded “${upload.name}” (${formatSize(upload.size)}) — stored in this browser only`
            : `Viewing ${published?.label ?? doc.fileName}`}
        </div>
        <div className="xp-statusbar__field hidden sm:block">Adobe Reader 6.0 (XP Edition)</div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="application/pdf,.pdf"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = '';
        }}
      />
    </div>
  );
};
