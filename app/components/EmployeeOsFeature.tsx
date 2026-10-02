import Image from 'next/image';
import { Database, FileText, Monitor, RotateCcw, WifiOff } from 'lucide-react';
import { Reveal } from './Reveal';

const productSignals = [
  { label: 'Windows x64', icon: Monitor },
  { label: 'Local-first', icon: Database },
  { label: 'Offline operation', icon: WifiOff },
  { label: 'Payroll & salary slips', icon: FileText },
  { label: 'Backup & restore', icon: RotateCcw },
];

const productUrl = 'https://employeeos.krafttdigital.in';

export function EmployeeOsFeature() {
  return (
    <section className="employee-os-home" id="employee-os" aria-labelledby="employee-os-home-title">
      <div className="employee-os-home-inner">
        <Reveal className="employee-os-home-copy" direction="left">
          <div className="employee-os-home-brand">
            <p className="eyebrow eyebrow-dark">Kraftt Digital product</p>
            <Image
              src="/assets/projects/employee-os/employee-os-wordmark.webp"
              alt="Employee OS"
              width={720}
              height={168}
              sizes="(max-width: 640px) 230px, 300px"
            />
          </div>

          <h2 id="employee-os-home-title">
            Employee operations, payroll and attendance—<br />
            <em>managed locally.</em>
          </h2>
          <p className="employee-os-home-intro">
            Employee OS is a Windows desktop application for managing employee records, attendance,
            payroll, salary slips, reports and backups without sending operational employee data to the cloud.
          </p>

          <ul className="employee-os-home-signals" aria-label="Employee OS product highlights">
            {productSignals.map(({ label, icon: Icon }) => (
              <li key={label}><Icon size={15} strokeWidth={1.6} aria-hidden="true" /><span>{label}</span></li>
            ))}
          </ul>

          <div className="employee-os-home-actions">
            <a
              href={productUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Explore Employee OS on its product website"
            >
              Explore Employee OS <span aria-hidden="true">↗</span>
            </a>
            <a
              href={`${productUrl}/#download`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open the secure Employee OS download request"
            >
              Download for Windows <span aria-hidden="true">↓</span>
            </a>
          </div>

          <a
            className="employee-os-home-guide"
            href={`${productUrl}/guides/Employee-OS-User-Guide.pdf`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the User Guide <span aria-hidden="true">↗</span>
          </a>
        </Reveal>

        <Reveal className="employee-os-home-visual" direction="right">
          <div className="employee-os-home-window-bar" aria-hidden="true">
            <span /><span /><span /><strong>Employee OS · Dashboard</strong>
          </div>
          <Image
            src="/assets/projects/employee-os/employee-os-dashboard.webp"
            alt="Employee OS dashboard showing employee, attendance and payroll summaries for dummy records"
            width={1440}
            height={900}
            sizes="(max-width: 900px) 94vw, 55vw"
          />
          <div className="employee-os-home-local-note">
            <strong>Data stays on your computer</strong>
            <span>Normal employee and payroll work runs locally after installation.</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
