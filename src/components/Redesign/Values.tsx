import React, { useState } from 'react';
import styled from 'styled-components';

type MemberType = 'Theatres' | 'Artists';

const Values = () => {
  const [member, setMember] = useState<MemberType>('Artists');

  const toggleMember = () => {
    setMember((prevMember) =>
      prevMember === 'Artists' ? 'Theatres' : 'Artists'
    );
  };

  return (
    <div>
      {/* Title */}
      <h1 className="text-center">Find</h1>
      {/* Toggle */}
      <label className="relative inline-flex cursor-pointer items-center">
        <input type="checkbox" value="" checked className="peer sr-only" />
        <div className="after: dark:border-slate-600 dark:bg-slate-700 peer flex h-8 items-center gap-4 rounded-full bg-orange-600 px-3 text-sm text-white after:absolute after:left-1 after:h-6 after:w-16 after:rounded-full after:bg-white/40 after:transition-all after:content-[''] peer-checked:bg-stone-600 peer-checked:after:translate-x-full peer-focus:outline-none">
          <span>General</span>
          <span>Project</span>
        </div>
      </label>
    </div>
  );
};

export default Values;
