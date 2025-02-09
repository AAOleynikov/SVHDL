import { debounce } from "@/shared/utils/debounce";
import { reactive,  provide, watch, onBeforeUnmount } from "vue";

interface CellClass<CellType extends object, CellJson extends object> {
  loadFromJson: (json: CellJson) => CellType;
  saveToJson: (cell: CellType) => CellJson;
  defaultValue: CellJson;
  name: string;
  debouncePeriodMs: number;
}

const cellStatuses = reactive<Record<string, boolean>>({});
// Implement the registerCell function
export function registerCell<CellType extends object, CellJson extends object>(
  cellClass: CellClass<CellType, CellJson>
): void {
  const { name, loadFromJson, saveToJson, defaultValue, debouncePeriodMs } =
    cellClass;

  // Step 1: Load from localStorage or use defaultValue
  let cellData: CellType;
  const storedJson = localStorage.getItem(name);

  if (storedJson) {
    try {
      const parsed: CellJson = JSON.parse(storedJson);
      cellData = loadFromJson(parsed);
    } catch (error) {
      console.warn(
        `Failed to parse localStorage for "${name}". Using default value.`,
        error
      );
      cellData = loadFromJson(defaultValue);
    }
  } else {
    cellData = loadFromJson(defaultValue);
  }

  // Step 2: Make the cell data reactive
  const reactiveData = reactive<CellType>(cellData);

  // Step 3: Provide the reactive data to the Vue component tree
  provide(name, reactiveData);

  // Step 4: Initialize the status as synchronized
  cellStatuses[name] = true;

  // Step 5: Create a debounced save function
  const debouncedSave = debounce(() => {
    try {
      const jsonToSave = JSON.stringify(saveToJson(reactiveData as CellType));
      localStorage.setItem(name, jsonToSave);
      cellStatuses[name] = true; // Mark as synchronized
    } catch (error) {
      console.error(`Error saving cell "${name}" to localStorage:`, error);
    }
  }, debouncePeriodMs);

  // Step 6: Watch for changes in the reactive data
  watch(
    () => reactiveData,
    () => {
      cellStatuses[name] = false; // Mark as unsynchronized
      debouncedSave();
    },
    { deep: true }
  );

  // Step 7: Ensure data is saved when the user leaves the page
  const handleBeforeUnload = () => {
    try {
      const jsonToSave = JSON.stringify(saveToJson(reactiveData as CellType));
      localStorage.setItem(name, jsonToSave);
    } catch (error) {
      console.error(`Error saving cell "${name}" on unload:`, error);
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  // Clean up the event listener when the component is unmounted
  onBeforeUnmount(() => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  });
}
