import { useState } from 'react';
import { playWelcome, setSoundOn, soundOn } from '../lib/sound';

export default function SoundToggle() {
  const [on, setOn] = useState(soundOn);
  return (
    <label className="toggle">
      <input
        type="checkbox"
        checked={on}
        onChange={(e) => {
          setOn(e.target.checked);
          setSoundOn(e.target.checked);
          if (e.target.checked) playWelcome(); // a sample, so you know what it sounds like
        }}
      />
      <span>Play a soft chime when you open Shorts and when you save a paper</span>
    </label>
  );
}
