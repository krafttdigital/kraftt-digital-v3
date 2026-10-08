'use client';
import { useEffect, useId, useRef, type ReactNode } from 'react';
export type FormStep = { id: string; label: string };
export function DocumentFormNavigation({ steps, active, onChange }: { steps: FormStep[]; active: string; onChange: (id: string) => void }) {
  const nav = useRef<HTMLDivElement>(null);
  const index = Math.max(0, steps.findIndex(step => step.id === active));
  useEffect(() => {
    const root = nav.current, button = root?.querySelector<HTMLButtonElement>('[aria-current="step"]');
    if (root && button) { const left = button.offsetLeft - root.offsetLeft; if (left < root.scrollLeft) root.scrollLeft = left; else if (left + button.offsetWidth > root.scrollLeft + root.clientWidth) root.scrollLeft = left + button.offsetWidth - root.clientWidth; }
  }, [active]);
  return <nav className="admin-form-navigation" aria-label="Document form sections">
    <div className="admin-form-step-list" ref={nav} onKeyDown={event => {
      if (!['ArrowRight','ArrowLeft','Home','End'].includes(event.key)) return;
      const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
      const current = buttons.indexOf(event.target as HTMLButtonElement);
      if (current < 0) return;
      event.preventDefault();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? steps.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + steps.length) % steps.length;
      onChange(steps[next].id); buttons[next].focus();
    }}>{steps.map((step,i) => <button type="button" key={step.id} aria-current={step.id === active ? 'step' : undefined} onClick={() => onChange(step.id)}><span>{i+1}</span>{step.label}</button>)}</div>
    <div className="admin-form-step-controls"><span>{index+1} / {steps.length} · {steps[index]?.label}</span><button type="button" disabled={index===0} onClick={()=>onChange(steps[index-1].id)}>Previous</button><button type="button" disabled={index===steps.length-1} onClick={()=>onChange(steps[index+1].id)}>Next</button></div>
  </nav>;
}
export function DocumentFormContent({ active, children, enabled=true }: { active: string; children: ReactNode; enabled?: boolean }) {
  const root = useRef<HTMLDivElement>(null), id = useId();
  useEffect(() => { if (root.current) root.current.scrollTop = 0; }, [active]);
  return <div id={id} ref={root} className={enabled ? 'admin-form-content' : undefined}>{children}</div>;
}
