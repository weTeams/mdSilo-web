import { useMemo, useRef, useState, useCallback } from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';
import type { TablerIcon } from '@tabler/icons';
import { IconUnlink, IconLink, IconFilePlus } from '@tabler/icons';
import { v4 as uuidv4 } from 'uuid';
import { upsertDbNote } from 'lib/api/curdNote';
import {
  insertExternalLink,
  insertNoteLink,
  removeLink,
} from 'editor/formatting';
import { isUrl, ciStringEqual } from 'utils/helper';
import { useAuthContext } from 'utils/useAuth';
import useNoteSearch from 'editor/hooks/useNoteSearch';
import { getFileHandle } from 'editor/hooks/useFSA';
import { store, useStore } from 'lib/store';
import { defaultNote } from 'types/model';
import EditorPopover from './EditorPopover';
import type { AddLinkPopoverState } from './Editor';

enum OptionType {
  NOTE,
  NEW_NOTE,
  URL,
  REMOVE_LINK,
}

type Option = {
  id: string;
  type: OptionType;
  text: string;
  icon?: TablerIcon;
};

type Props = {
  addLinkPopoverState: AddLinkPopoverState;
  setAddLinkPopoverState: (state: AddLinkPopoverState) => void;
};

// trigger: ctr+k or Link btn from hovering toolbar
export default function AddLinkPopover(props: Props) {
  const { addLinkPopoverState, setAddLinkPopoverState } = props;
  const { user } = useAuthContext();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [linkText, setLinkText] = useState<string>('');
  const editor = useSlate();

  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number>(0);

  const search = useNoteSearch({ numOfResults: 10 });
  const searchResults = useMemo(() => search(linkText), [search, linkText]);

  const options = useMemo(() => {
    const result: Array<Option> = [];
    if (linkText) {
      // Show url option if `linkText` is a url
      if (isUrl(linkText)) {
        result.push({
          id: 'URL',
          type: OptionType.URL,
          text: `Link to web page: ${linkText}`,
          icon: IconLink,
        });
      }
      // Show new note option if there isn't already a note called `linkText`
      // (We assume if there is a note, then it will be the first result)
      else if (
        searchResults.length <= 0 || 
        !ciStringEqual(linkText, searchResults[0].item.title)
      ) {
        result.push({
          id: 'NEW_NOTE',
          type: OptionType.NEW_NOTE,
          text: `New: ${linkText}`,
          icon: IconFilePlus,
        });
      }
    }
    // Show remove link option if there is no `linkText` and the selected text is part of a link
    else if (addLinkPopoverState.isLink) {
      result.push({
        id: 'REMOVE_LINK',
        type: OptionType.REMOVE_LINK,
        text: 'Remove link',
        icon: IconUnlink,
      });
    }
    // Show notes that match `linkText`
    result.push(
      ...searchResults.map((result) => ({
        id: result.item.id,
        type: OptionType.NOTE,
        text: result.item.title,
      }))
    );
    return result;
  }, [addLinkPopoverState.isLink, searchResults, linkText]);

  const hidePopover = useCallback(() => {
    if (!addLinkPopoverState.selection) {
      return;
    }

    Transforms.select(editor, addLinkPopoverState.selection); // Restore the editor selection
    ReactEditor.focus(editor); // Focus the editor
    setAddLinkPopoverState({
      isVisible: false,
      selection: undefined,
      isLink: false,
    });
  }, [editor, addLinkPopoverState, setAddLinkPopoverState]);

  const offlineMode = useStore((state) => state.offlineMode);

  const onOptionClick = useCallback(
    async (option?: Option) => {
      if (!option || (!offlineMode && !user)) {
        return;
      }

      // Restore selection and hide popover
      hidePopover();

      if (option.type === OptionType.NOTE) {
        // Insert a link to an existing note with the note title as the link text
        insertNoteLink(editor, option.id, option.text);
        Transforms.move(editor, { distance: 1, unit: 'offset' }); // Focus after the note link
      } else if (option.type === OptionType.URL) {
        // Insert a link to a url
        insertExternalLink(editor, linkText);
        Transforms.move(editor, { distance: 1, unit: 'offset' }); // Focus after the note link
      } else if (option.type === OptionType.NEW_NOTE) {
        // Add a new note and insert a link to it with the note title as the link text
        const noteId = uuidv4();
        insertNoteLink(editor, noteId, linkText);
        Transforms.move(editor, { distance: 1, unit: 'offset' }); // Focus after the note link
        // update to store or db
        const res = offlineMode || !user 
          ? {
              data: { ...defaultNote, id: noteId, title: linkText },
              error: null,
            }
          : await upsertDbNote({ id: noteId, user_id: user.id, title: linkText }, user.id);
        const note = res.data;
        if (note) { 
          store.getState().upsertNote(note); 
          // new FileHandle and set in store
          await getFileHandle(note.title);
        }
      } else if (option.type === OptionType.REMOVE_LINK) {
        // Remove the link
        removeLink(editor);
      } else {
        throw new Error(`Option type ${option.type} is not supported`);
      }
    },
    [editor, user, offlineMode, hidePopover, linkText]
  );

  const onKeyDown = useCallback(
    (event) => {
      // Update the selected option based on arrow key input
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedOptionIndex((index) => {
          return index <= 0 ? options.length - 1 : index - 1;
        });
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedOptionIndex((index) => {
          return index >= options.length - 1 ? 0 : index + 1;
        });
      }
    },
    [options.length]
  );

  return (
    <EditorPopover
      selection={addLinkPopoverState.selection}
      placement="bottom"
      className="flex flex-col pt-4 pb-2 w-96"
      onClose={hidePopover}
    >
      <input
        ref={inputRef}
        type="text"
        className="mx-4 input dark:bg-gray-700 dark:text-gray-200 dark:border-gray-700"
        value={linkText}
        onChange={(e) => setLinkText(e.target.value.trim())}
        placeholder="Search for a note or enter web page link"
        onKeyPress={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault();
            onOptionClick(options[selectedOptionIndex]);
          }
        }}
        onKeyDown={onKeyDown}
        autoFocus
      />
      <div className="mt-2">
        {options.map((option, index) => (
          <OptionItem
            key={option.id}
            option={option}
            isSelected={index === selectedOptionIndex}
            onClick={() => onOptionClick(option)}
          />
        ))}
      </div>
    </EditorPopover>
  );
}

type OptionProps = {
  option: Option;
  isSelected: boolean;
  onClick: () => void;
};

const OptionItem = (props: OptionProps) => {
  const { option, isSelected, onClick } = props;

  return (
    <div
      className={`flex flex-row items-center px-4 py-1 cursor-pointer text-gray-800 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-200 dark:hover:bg-gray-700 dark:active:bg-gray-600 ${
        isSelected ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
      onPointerDown={(event) => event.preventDefault()}
      onPointerUp={(event) => {
        if (event.button === 0) {
          event.preventDefault();
          onClick();
        }
      }}
    >
      {option.icon ? (
        <option.icon size={18} className="flex-shrink-0 mr-1" />
      ) : null}
      <span className="overflow-hidden overflow-ellipsis whitespace-nowrap">
        {option.text}
      </span>
    </div>
  );
};
