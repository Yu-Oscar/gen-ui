import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, CheckCheck } from "lucide-react";

interface ModelDropdownProps {
  model: string;
  setModel: (model: string) => void;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({ model, setModel }) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild className="w-max ml-5 text-xl">
        <button
          className="flex flex-row text-zinc-400 justify-center items-center px-4 py-1 hover:text-zinc-400 hover:bg-zinc-700 focus:bg-zinc-700 rounded-[6px] gap-x-2 bg-transparent w-36">
          <span>{model}</span>
          <ChevronDown/>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content className="w-max bg-zinc-700 rounded-[6px] py-2 text-md" sideOffset={0} align="start">
          <DropdownMenu.RadioGroup 
            value={model} 
            onValueChange={setModel}
            className="px-4 py-1"
          >
            <DropdownMenu.RadioItem className="flex items-center p-3 cursor-pointer hover:bg-zinc-500 rounded-[6px] w-36" value="GPT-4o">
              <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator mr-10">
                <CheckCheck className="w-5 h-5"/>
              </DropdownMenu.ItemIndicator>
              <span className="ml-auto">GPT-4o</span>
            </DropdownMenu.RadioItem>
            <DropdownMenu.RadioItem  className="flex items-center p-3 cursor-pointer hover:bg-zinc-500 rounded-[6px] gap-x-4 w-36" value="code">
              <DropdownMenu.ItemIndicator className="DropdownMenuItemIndicator">
                <CheckCheck className="w-5 h-5"/>
              </DropdownMenu.ItemIndicator>
              <span className="ml-auto">Code</span>
            </DropdownMenu.RadioItem>
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default ModelDropdown;
