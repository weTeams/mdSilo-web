import Link from 'next/link';
import LogoWithText from 'components/LogoWithText';

type Props = {
  className?: string;
};

export default function Footer(props: Props) {
  const { className } = props;
  return (
    <div className={`py-8 md:py-16 ${className}`}>
      <div className="container flex flex-col justify-between px-6 lg:flex-row">
        <div>
          <div className="inline-block">
            <LogoWithText />
          </div>
          <p className="pt-0.5 text-gray-300 max-w-sm">
          </p>
          <div className="flex flex-wrap mt-2 space-x-2">
            <Link href="/about">
              <a className="text-gray-300 hover:text-primary-500">About</a>
            </Link>
            <Link href="/privacy">
              <a className="text-gray-300 hover:text-primary-500">Privacy</a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-300 hover:text-primary-500">Terms</a>
            </Link>
            <a
              href="https://trello.com/b/xzIFkNGb/mdsilo-roadmap"
              className="text-gray-300 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Roadmap
            </a>
          </div>
        </div>
        <div className="flex flex-wrap flex-1 space-x-16 lg:justify-end">
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-medium">Product</p>
            <Link href="/sponsors">
              <a className="text-gray-300 hover:text-primary-500">Source Code</a>
            </Link>
            <Link href="/app/demo">
              <a className="text-gray-300 hover:text-primary-500">Help Center</a>
            </Link>
          </div>
          <div className="flex flex-col mt-8 space-y-2 lg:mt-0">
            <p className="font-medium">Community</p>
            <a
              href="https://twitter.com/mdsiloapp"
              className="text-gray-300 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Twitter
            </a>
            <a
              href="https://discord.gg/EXYSEHRTFt"
              className="text-gray-300 hover:text-primary-500"
              target="_blank"
              rel="noopener noreferrer"
            >
              Discuss
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
