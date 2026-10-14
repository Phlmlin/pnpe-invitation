import React from 'react';

export default function ProtocolBanner() {
  return (
    <div className="w-full h-[3px] flex" aria-hidden="true">
      <div className="w-1/3 h-full bg-[#009E60]" />
      <div className="w-1/3 h-full bg-[#FCD116]" />
      <div className="w-1/3 h-full bg-[#3A75C4]" />
    </div>
  );
}
