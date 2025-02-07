import { memo, useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { IconDna, IconBookmarks, IconCheckbox } from '@tabler/icons';
import { useTransition, animated } from '@react-spring/web';
import Tooltip from 'components/misc/Tooltip';
import { isMobile } from 'utils/helper';
import { useStore } from 'lib/store';
import { SPRING_CONFIG } from 'constants/spring';
import SidebarItem from './SidebarItem';
import SidebarContent from './SidebarContent';
import SidebarHeader from './SidebarHeader';

type Props = {
  setIsFindOrCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setIsSettingsOpen: Dispatch<SetStateAction<boolean>>;
  setBillingOpen: Dispatch<SetStateAction<boolean>>;
  className?: string;
};

function Sidebar(props: Props) {
  const { 
    setIsFindOrCreateModalOpen, 
    setIsSettingsOpen, 
    setBillingOpen,
    className='' 
  } = props;

  const isSidebarOpen = useStore((state) => state.isSidebarOpen);
  const setIsSidebarOpen = useStore((state) => state.setIsSidebarOpen);
  const hideSidebarOnMobile = useCallback(() => {
    if (isMobile()) {
      setIsSidebarOpen(false);
    }
  }, [setIsSidebarOpen]);

  const transition = useTransition<
    boolean,
    {
      transform: string;
      dspl: number;
      backgroundOpacity: number;
      backgroundColor: string;
    }
  >(isSidebarOpen, {
    initial: {
      transform: 'translateX(0%)',
      dspl: 1,
      backgroundOpacity: 0.3,
      backgroundColor: 'black',
    },
    from: {
      transform: 'translateX(-100%)',
      dspl: 0,
      backgroundOpacity: 0,
      backgroundColor: 'transparent',
    },
    enter: {
      transform: 'translateX(0%)',
      dspl: 1,
      backgroundOpacity: 0.3,
      backgroundColor: 'black',
    },
    leave: {
      transform: 'translateX(-100%)',
      dspl: 0,
      backgroundOpacity: 0,
      backgroundColor: 'transparent',
    },
    config: SPRING_CONFIG,
    expires: (item) => !item,
  });

  return transition(
    (styles, item) =>
      item && (
        <>
          {isMobile() ? (
            <animated.div
              className="fixed inset-0 z-10"
              style={{
                backgroundColor: styles.backgroundColor,
                opacity: styles.backgroundOpacity,
                display: styles.dspl.to((displ) =>
                  displ === 0 ? 'none' : 'initial'
                ),
              }}
              onClick={() => setIsSidebarOpen(false)}
            />
          ) : null}
          <animated.div
            className="fixed top-0 bottom-0 left-0 z-20 w-64 shadow-popover md:shadow-none md:static md:z-0"
            style={{
              transform: styles.transform,
              display: styles.dspl.to((displ) =>
                displ === 0 ? 'none' : 'initial'
              ),
            }}
          >
            <div
              className={`flex flex-col flex-none h-full border-r bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 ${className}`}
            >
              <SidebarHeader 
                setIsSettingsOpen={setIsSettingsOpen} 
                setBillingOpen={setBillingOpen}
              />
              <ChronButton onClick={hideSidebarOnMobile} />
              <GraphButton onClick={hideSidebarOnMobile} />
              <TaskButton onClick={hideSidebarOnMobile} />
              <SidebarContent
                className="flex-1 mt-3 overflow-x-hidden overflow-y-auto"
                setIsFindOrCreateModalOpen={setIsFindOrCreateModalOpen}
              />
            </div>
          </animated.div>
        </>
      )
  );
}

const btnIconClass = 'flex-shrink-0 mr-1 text-gray-800 dark:text-gray-300';

type ButtonProps = {
  onClick: () => void;
};

const GraphButton = (props: ButtonProps) => {
  const { onClick } = props;
  const router = useRouter();

  return (
    <SidebarItem
      isHighlighted={router.pathname.includes('/app/graph')}
      onClick={onClick}
    >
      <Tooltip
        content="Visualization of networked notes (Ctrl+Shift+G)"
        placement="right"
        touch={false}
      >
        <span>
          <Link href="/app/graph">
            <a className="flex items-center px-6 py-1">
              <IconDna size={20} className={btnIconClass} />
              <span className="overflow-x-hidden select-none overflow-ellipsis whitespace-nowrap">
                Graph View
              </span>
            </a>
          </Link>
        </span>
      </Tooltip>
    </SidebarItem>
  );
};

const ChronButton = (props: ButtonProps) => {
  const { onClick } = props;
  const router = useRouter();

  return (
    <SidebarItem
      isHighlighted={router.pathname.includes('/app/chronicle')}
      onClick={onClick}
    >
      <Tooltip
        content="Chronicle my life (Ctrl+Shift+C)"
        placement="right"
        touch={false}
      >
        <span>
          <Link href="/app/chronicle">
            <a className="flex items-center px-6 py-1">
              <IconBookmarks size={20} className={btnIconClass} />
              <span className="overflow-x-hidden select-none overflow-ellipsis whitespace-nowrap">
                Chronicle
              </span>
            </a>
          </Link>
        </span>
      </Tooltip>
    </SidebarItem>
  );
};

const TaskButton = (props: ButtonProps) => {
  const { onClick } = props;
  const router = useRouter();

  return (
    <SidebarItem
      isHighlighted={router.pathname.includes('/app/tasks')}
      onClick={onClick}
    >
      <Tooltip
        content="Track Personal Tasks (Ctrl+Shift+T)"
        placement="right"
        touch={false}
      >
        <span>
          <Link href="/app/tasks">
            <a className="flex items-center px-6 py-1">
              <IconCheckbox size={20} className={btnIconClass} />
              <span className="overflow-x-hidden select-none overflow-ellipsis whitespace-nowrap">
                Tasks View
              </span>
            </a>
          </Link>
        </span>
      </Tooltip>
    </SidebarItem>
  );
};

export default memo(Sidebar);
