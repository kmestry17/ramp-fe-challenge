import Downshift from "downshift"
// Bug 1: Adding imports change
import { useCallback, useState, useEffect, useRef } from "react"
import classNames from "classnames"
import { DropdownPosition, GetDropdownPositionFn, InputSelectOnChange, InputSelectProps } from "./types"

export function InputSelect<TItem>({
  label,
  defaultValue,
  onChange: consumerOnChange,
  items,
  parseItem,
  isLoading,
  loadingLabel,
}: InputSelectProps<TItem>) {
  const [selectedValue, setSelectedValue] = useState<TItem | null>(defaultValue ?? null)
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
  })
  // Bug 1: Adding constants to fixed the dropdown position change starts
  const dropdownRef = useRef<HTMLDivElement>(null)
  const selectRef = useRef<HTMLDivElement>(null)

  const onChange = useCallback<InputSelectOnChange<TItem>>(
    (selectedItem) => {
      if (selectedItem === null) {
        return
      }

      consumerOnChange(selectedItem)
      setSelectedValue(selectedItem)
    },
    [consumerOnChange]
  )

  // Bug 1: Adding useEffect to fix the dropdown position change starts
  useEffect(() => {
    function handleScroll() {
      if (dropdownRef.current && selectRef.current) {
        const selectRect = selectRef.current.getBoundingClientRect()
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft
        setDropdownPosition({
          top: selectRect.bottom + scrollTop,
          left: selectRect.left + scrollLeft,
        })
      }
    }

    document.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", handleScroll)
    return () => {
      document.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleScroll)
    }
  }, [])
  // Bug 1: Adding useEffect to fix the dropdown position change ends

  return (
    <Downshift<TItem>
      id="RampSelect"
      onChange={onChange}
      selectedItem={selectedValue}
      itemToString={(item) => (item ? parseItem(item).label : "")}
    >
      {({
        getItemProps,
        getLabelProps,
        getMenuProps,
        isOpen,
        highlightedIndex,
        selectedItem,
        getToggleButtonProps,
        inputValue,
      }) => {
        const toggleProps = getToggleButtonProps()
        const parsedSelectedItem = selectedItem === null ? null : parseItem(selectedItem)

        return (
          // Bug 1: Adding className to fix the dropdown position change
          <div className="RampInputSelect--root">
            <label className="RampText--s RampText--hushed" {...getLabelProps()}>
              {label}
            </label>
            <div className="RampBreak--xs" />
            <div
              className="RampInputSelect--input"
              onClick={(event) => {
                setDropdownPosition(getDropdownPosition(event.target))
                toggleProps.onClick(event)
              }}
            >
              {inputValue}
            </div>

            <div
              className={classNames("RampInputSelect--dropdown-container", {
                "RampInputSelect--dropdown-container-opened": isOpen,
              })}
              {...getMenuProps()}
              style={{ top: dropdownPosition.top, left: dropdownPosition.left }}
            >
              {renderItems()}
            </div>
          </div>
        )

        function renderItems() {
          if (!isOpen) {
            return null
          }

          if (isLoading) {
            return <div className="RampInputSelect--dropdown-item">{loadingLabel}...</div>
          }

          if (items.length === 0) {
            return <div className="RampInputSelect--dropdown-item">No items</div>
          }

          return items.map((item, index) => {
            const parsedItem = parseItem(item)
            return (
              <div
                key={parsedItem.value}
                {...getItemProps({
                  key: parsedItem.value,
                  index,
                  item,
                  className: classNames("RampInputSelect--dropdown-item", {
                    "RampInputSelect--dropdown-item-highlighted": highlightedIndex === index,
                    "RampInputSelect--dropdown-item-selected":
                      parsedSelectedItem?.value === parsedItem.value,
                  }),
                })}
              >
                {parsedItem.label}
              </div>
            )
          })
        }
      }}
    </Downshift>
  )
}

const getDropdownPosition: GetDropdownPositionFn = (target) => {
  if (target instanceof Element) {
    // Bug 1: Adding const to fix the dropdown position change
    const { top, left, height } = target.getBoundingClientRect()
    // Bug 1: Adding const to fix the dropdown position change
    const { scrollY, scrollX } = window
    return {
      // Bug 1: Adding const to fix the dropdown position change
      top: scrollY + top + height,
      left: scrollX + left,
    }
  }

  return { top: 0, left: 0 }
}
