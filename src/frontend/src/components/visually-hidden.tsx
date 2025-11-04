// see: https://github.com/twbs/bootstrap/blob/main/scss/mixins/_visually-hidden.scss
import { HtmlHTMLAttributes } from 'react';

import styles from './visually-hidden.module.css';

export type VisuallyHiddenProps = HtmlHTMLAttributes<HTMLSpanElement>;

const VisuallyHidden = ({ children, ...props }: VisuallyHiddenProps) => {
  return (
    <span className={styles.visuallyHidden} {...props}>
      {children}
    </span>
  );
};

export default VisuallyHidden;
