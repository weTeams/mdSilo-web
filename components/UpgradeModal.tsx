import { useMemo } from 'react';
import { useStore } from 'lib/store';
import useHotkeys from 'editor/hooks/useHotkeys';
import Billing from './settings/Billing';

export default function UpgradeModal() {
  const setIsUpgradeModalOpen = useStore(
    (state) => state.setIsUpgradeModalOpen
  );

  const hotkeys = useMemo(
    () => [
      {
        hotkey: 'esc',
        callback: () => setIsUpgradeModalOpen(false),
      },
    ],
    [setIsUpgradeModalOpen]
  );
  useHotkeys(hotkeys);

  return (
    <div className="fixed inset-0 z-20 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-30"
        onClick={() => setIsUpgradeModalOpen(false)}
      />
      <div className="flex items-center justify-center h-screen p-6">
        <div className="z-30 flex w-full h-full max-w-full bg-white rounded dark:bg-gray-800 dark:text-gray-100 max-h-128 sm:w-192 xl:w-240 xl:max-h-176 shadow-popover">
          <Billing />
        </div>
      </div>
    </div>
  );
}
