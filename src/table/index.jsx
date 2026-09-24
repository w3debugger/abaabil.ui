/**
 * Table, normal tier. A real <table> for a list of records: a caption,
 * one <th scope="col"> per column, one row per item. Structure only: no
 * styles, no ARIA logic. Contains no hooks, so it renders in both
 * server and client trees.
 *
 * The platform already does the hard part of a data table. A <table>
 * with a <caption> has a name, <th scope="col"> ties every cell to its
 * column so a screen reader announces "Price, 12.00" rather than
 * "12.00", and rows and columns are navigable with the reader's own
 * table commands. None of that has to be rebuilt, and a grid of divs
 * wearing table semantics is the one design this component exists to
 * avoid.
 *
 * The decision that keeps it small is that it takes data, not JSX:
 * `columns` describes the header row and `rows` is the array, so the
 * caller writes no markup and the a11y tier can sort the same array
 * before it reaches the same element. A column may still own its cell
 * with `cell(row)` for a link or a formatted number.
 *
 * `scrollProps`, `captionProps` and a column's `headerProps` exist so
 * the a11y tier can reach the wrapper, the caption and each <th>
 * without rendering its own copy of this markup.
 *
 * @param {object} props
 * @param {Array<{ key: string, header: import('react').ReactNode, align?: 'start'|'end'|'center', width?: string|number, cell?: (row: object) => import('react').ReactNode, headerProps?: object }>} props.columns
 * @param {object[]} props.rows Keyed by column key, plus an optional `id`.
 * @param {import('react').ReactNode} [props.caption]
 * @param {string|((row: object, index: number) => React.Key)} [props.rowKey='id']
 *   Field name or function giving each row its key. Falls back to the index.
 * @param {object} [props.scrollProps] Spread onto the scroll wrapper.
 * @param {object} [props.captionProps] Spread onto the <caption>.
 * @param {string} [props.className] Merged with the base class, on the <table>.
 */
export default function Table({
  columns,
  rows,
  caption,
  rowKey = 'id',
  scrollProps,
  captionProps,
  className,
  ...props
}) {
  const cls = className ? `abaabil-table ${className}` : 'abaabil-table'
  const keyOf = typeof rowKey === 'function' ? rowKey : (row, i) => row[rowKey] ?? i

  return (
    <div className="abaabil-table__scroll" {...scrollProps}>
      <table className={cls} {...props}>
        {caption ? <caption {...captionProps}>{caption}</caption> : null}
        <thead>
          <tr>
            {columns.map(({ key, header, align, width, headerProps }) => (
              <th
                key={key}
                scope="col"
                data-align={align}
                style={width ? { inlineSize: width } : undefined}
                {...headerProps}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={keyOf(row, i)}>
              {columns.map(({ key, align, cell }) => (
                <td key={key} data-align={align}>
                  {cell ? cell(row) : row[key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
