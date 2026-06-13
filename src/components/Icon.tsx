import { icon } from '@fortawesome/fontawesome-svg-core';

export default function Icon({ className = '', definition }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: icon(definition).html.join('') }} />;
}
