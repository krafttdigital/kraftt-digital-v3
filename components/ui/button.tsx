import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex min-h-12 items-center justify-center whitespace-nowrap border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a882] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-[#8b7355] bg-[#8b7355] text-[#f2efe9] hover:border-[#c5a882] hover:bg-[#c5a882] hover:text-[#0d0d0d]',
        outline: 'border-[#e8dcc8] bg-transparent text-[#e8dcc8] hover:bg-[#e8dcc8] hover:text-[#0d0d0d]',
        secondary: 'border-[#1e1e1e] bg-[#1e1e1e] text-[#e8dcc8] hover:border-[#8b7355]',
        ghost: 'border-transparent bg-transparent text-[#e8dcc8] hover:border-[#8b7355]',
        link: 'min-h-0 border-x-0 border-t-0 border-b-[#e8dcc866] bg-transparent px-0 py-2 text-[#e8dcc8] hover:border-b-[#c5a882] hover:text-[#c5a882]',
        destructive: 'border-red-800 bg-red-800 text-white hover:bg-red-900',
      },
      size: {
        default: 'px-6 py-3',
        sm: 'min-h-10 px-4 py-2 text-xs',
        lg: 'min-h-14 px-8 py-4',
        icon: 'h-12 w-12 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
