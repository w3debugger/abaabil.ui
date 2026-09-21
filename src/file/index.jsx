/**
 * File, normal tier. A native <input type="file"> and nothing else.
 * Structure only: no styles, no ARIA logic. Contains no hooks, so it
 * renders in both server and client trees.
 *
 * Deliberately not a <button> with a hidden input behind it, which is
 * the usual way this gets built. That pattern has to reimplement the
 * label association, the keyboard activation and the announcement of
 * the chosen file, and it usually reimplements at most one of them. The
 * real control already does all three, and it can be styled, because
 * ::file-selector-button is a real pseudo-element.
 *
 * @param {object} props
 * @param {string} [props.className] Merged with the base class.
 */
export default function File({ className, ...props }) {
  const cls = className ? `abaabil-file ${className}` : 'abaabil-file'

  return <input type="file" className={cls} {...props} />
}
