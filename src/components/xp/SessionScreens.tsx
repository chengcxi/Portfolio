import React, { useEffect, useRef, useState } from 'react';
import { PowerIcon, WindowsFlagIcon } from '../XpIcons';
import { playXpSound } from '../../utils/xpSounds';
import { WALLPAPER } from '../../assets/wallpaper';

export const XpLogo: React.FC = () => (
  <div className="flex items-end gap-2 text-white">
    <WindowsFlagIcon size={58} />
    <div className="leading-none">
      <div className="text-[13px] font-bold tracking-wide">
        Microsoft<sup className="text-[8px]">®</sup>
      </div>
      <div className="flex items-start">
        <span
          className="text-[42px] font-bold tracking-tight"
          style={{ fontFamily: "'Franklin Gothic Medium', 'Trebuchet MS', Arial, sans-serif" }}
        >
          Windows
        </span>
        <span className="ml-1 text-[24px] font-bold italic text-[#ff7b00]">xp</span>
      </div>
      <div className="mt-0.5 text-[10px] tracking-[0.25em] text-[#dfe9ff]">PORTFOLIO EDITION</div>
    </div>
  </div>
);

export const BootScreen: React.FC<{ onDone: () => void }> = ({ onDone }) => {
  const doneRef = useRef(onDone);
  doneRef.current = onDone;
  useEffect(() => {
    const t = window.setTimeout(() => doneRef.current(), 2600);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <div
      className="absolute inset-0 z-[10000] flex cursor-pointer flex-col items-center justify-center bg-black"
      onClick={() => doneRef.current()}
    >
      <XpLogo />
      <div className="xp-boot-bar mt-14">
        <div className="xp-boot-blocks">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="absolute bottom-6 left-6 text-[11px] text-[#8d8d8d]">Copyright © chengcxi · click to skip</div>
      <div className="absolute bottom-6 right-6 text-[13px] font-bold italic text-white">github.com/chengcxi</div>
    </div>
  );
};

/** `fromBoot` is true only on the first welcome screen after startup, so the Windows XP startup sound plays then (not after a log off). */
export const LoginScreen: React.FC<{ avatar: string; onLogin: () => void; onTurnOff: () => void; fromBoot?: boolean }> = ({
  avatar,
  onLogin,
  onTurnOff,
  fromBoot = false,
}) => {
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    if (fromBoot) playXpSound('startup');
  }, [fromBoot]);

  const login = () => {
    if (welcome) return;
    setWelcome(true);
    window.setTimeout(onLogin, 1500);
  };

  return (
    <div className="absolute inset-0 z-[10000] flex flex-col text-white" style={{ background: '#5a7edc' }}>
      <div className="relative h-[13%] min-h-[54px] bg-[#00309c]">
        <div
          className="absolute inset-x-0 bottom-0 h-[2px]"
          style={{ background: 'linear-gradient(to right, #00309c 0%, #ffffff 35%, #5a7edc 70%, #00309c 100%)' }}
        />
      </div>

      <div
        className="relative flex flex-1 items-center justify-center overflow-hidden"
        style={{ background: 'radial-gradient(circle at 6% 8%, #a8c1f5 0%, #7a9ae6 14%, #5a7edc 42%, #5a7edc 100%)' }}
      >
        {welcome ? (
          <div
            className="xp-fade-in text-[46px] font-bold italic"
            style={{
              fontFamily: "'Franklin Gothic Medium', 'Trebuchet MS', Arial, sans-serif",
              textShadow: '2px 2px 3px rgba(0,0,0,.35)',
            }}
          >
            welcome
          </div>
        ) : (
          <div className="flex w-full max-w-[920px] flex-col items-center gap-8 px-6 md:flex-row md:gap-0">
            <div className="flex flex-col items-center text-center md:w-1/2 md:items-end md:pr-10 md:text-right">
              <XpLogo />
              <p className="mt-6 text-[16px]">To begin, click your user name</p>
            </div>
            <div
              className="hidden h-[280px] w-px md:block"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,.85) 50%, rgba(255,255,255,0))',
              }}
            />
            <div className="flex w-full flex-col items-center gap-3 md:w-1/2 md:items-start md:pl-10">
              <button type="button" className="xp-login-user" onClick={login}>
                <img className="xp-login-user__pic" src={avatar} alt="" />
                <span>
                  <span className="block text-[20px]" style={{ fontFamily: "'Trebuchet MS', Tahoma, sans-serif" }}>
                    chengcxi
                  </span>
                  <span className="block text-[11px] text-[#d6e3ff]">Portfolio owner · github.com/chengcxi</span>
                </span>
              </button>
              <button type="button" className="xp-login-user" onClick={login}>
                <img className="xp-login-user__pic" src={WALLPAPER} alt="" />
                <span>
                  <span className="block text-[20px]" style={{ fontFamily: "'Trebuchet MS', Tahoma, sans-serif" }}>
                    Guest
                  </span>
                  <span className="block text-[11px] text-[#d6e3ff]">Visitors, recruiters &amp; friends</span>
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="relative flex h-[13%] min-h-[54px] items-center justify-between bg-[#00309c] px-6">
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: 'linear-gradient(to right, #00309c 0%, #f99736 40%, #c86d27 60%, #00309c 100%)' }}
        />
        <button type="button" className="flex items-center gap-2 text-[14px] hover:brightness-110" onClick={onTurnOff}>
          <PowerIcon variant="off" size={26} />
          Turn off computer
        </button>
        <p className="hidden max-w-[330px] text-right text-[11px] text-[#c9d8ff] sm:block">
          After you log on, click or scroll anywhere to pluck a classical guitar string. 🎸
        </p>
      </div>
    </div>
  );
};

const PowerOption: React.FC<{
  variant: 'standby' | 'off' | 'restart' | 'logoff' | 'switch';
  label: string;
  onClick: () => void;
}> = ({ variant, label, onClick }) => (
  <button type="button" onClick={onClick} className="group flex w-[76px] flex-col items-center gap-1.5 text-white">
    <span className="transition group-hover:brightness-115 group-active:brightness-90">
      <PowerIcon variant={variant} size={36} />
    </span>
    <span className="text-[11px]">{label}</span>
  </button>
);

export const PowerDialog: React.FC<{
  kind: 'shutdown' | 'logoff';
  onCancel: () => void;
  onStandBy: () => void;
  onTurnOff: () => void;
  onRestart: () => void;
  onLogOff: () => void;
  onSwitchUser: () => void;
}> = ({ kind, onCancel, onStandBy, onTurnOff, onRestart, onLogOff, onSwitchUser }) => (
  <div className="absolute inset-0 z-[9900] flex items-center justify-center bg-black/20 p-3">
    <div className="w-[330px] max-w-full overflow-hidden rounded-[6px] border border-[#00309c] shadow-[4px_6px_18px_rgba(0,0,0,0.5)]">
      <div className="flex h-[46px] items-center justify-between bg-[#00309c] px-3 text-white">
        <span className="text-[16px]" style={{ fontFamily: "'Trebuchet MS', Tahoma, sans-serif" }}>
          {kind === 'shutdown' ? 'Turn off computer' : 'Log Off Windows'}
        </span>
        <WindowsFlagIcon size={26} />
      </div>
      <div
        className="relative flex h-[120px] items-center justify-around px-4"
        style={{ background: 'linear-gradient(to bottom, #7c9ce8 0%, #5a7edc 100%)' }}
      >
        <div
          className="absolute inset-x-0 top-0 h-[2px]"
          style={{ background: 'linear-gradient(to right, #5a7edc, #ffffff 50%, #5a7edc)' }}
        />
        {kind === 'shutdown' ? (
          <>
            <PowerOption variant="standby" label="Stand By" onClick={onStandBy} />
            <PowerOption variant="off" label="Turn Off" onClick={onTurnOff} />
            <PowerOption variant="restart" label="Restart" onClick={onRestart} />
          </>
        ) : (
          <>
            <PowerOption variant="switch" label="Switch User" onClick={onSwitchUser} />
            <PowerOption variant="logoff" label="Log Off" onClick={onLogOff} />
          </>
        )}
      </div>
      <div className="flex h-[44px] items-center justify-end bg-[#00309c] px-3">
        <button type="button" className="xp-btn min-w-[75px]" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export const StandbyScreen: React.FC<{ onWake: () => void }> = ({ onWake }) => (
  <div className="absolute inset-0 z-[10000] flex cursor-pointer items-end justify-center bg-black pb-10" onClick={onWake}>
    <span className="text-[11px] text-[#3a3a3a]">Stand by — click anywhere to wake up</span>
  </div>
);

export const PoweredOffScreen: React.FC<{ onPowerOn: () => void }> = ({ onPowerOn }) => (
  <div className="absolute inset-0 z-[10000] flex flex-col items-center justify-center gap-6 bg-black px-6 text-center">
    <p className="text-[22px] font-bold text-[#ff8c00]" style={{ fontFamily: 'Arial, sans-serif' }}>
      It&apos;s now safe to turn off your computer.
    </p>
    <button type="button" className="xp-btn xp-btn-primary px-5" onClick={onPowerOn}>
      ⏻ Power On
    </button>
  </div>
);
