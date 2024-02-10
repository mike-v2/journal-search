import { ComponentPropsWithRef, forwardRef } from 'react';

export const Input = forwardRef<
  HTMLInputElement,
  ComponentPropsWithRef<'input'>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className='h-12 w-full rounded-xl border-2 border-gray-300 p-3'
      {...props}
    />
  );
});

Input.displayName = 'input';
