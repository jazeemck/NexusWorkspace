"use client";
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

const transition: any = {
  type: "spring",
  mass: 0.5,
  damping: 11.5,
  stiffness: 100,
  restDelta: 0.001,
  restSpeed: 0.001,
};

export const MenuItem = ({
  setActive,
  active,
  item,
  children,
  orientation = "horizontal",
  placement = "bottom",
  itemClassName,
  trigger,
}: {
  setActive: (item: string) => void;
  active: string | null;
  item: string;
  children?: React.ReactNode;
  orientation?: "horizontal" | "vertical";
  placement?: "top" | "bottom";
  itemClassName?: string;
  trigger?: React.ReactNode;
}) => {
  return (
    <div onMouseEnter={() => setActive(item)} className="relative ">
      <motion.div
        transition={{ duration: 0.3 }}
        className={cn(
          "cursor-pointer hover:opacity-[0.9]",
          itemClassName
        )}
      >
        {trigger || item}
      </motion.div>
      {active !== null && (
        <motion.div
          initial={{ 
            opacity: 0, 
            scale: 0.85, 
            y: orientation === "horizontal" ? (placement === "top" ? -10 : 10) : 0, 
            x: orientation === "vertical" ? 10 : 0 
          }}
          animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
          transition={transition}
        >
          {active === item && (
            <div className={cn(
              "absolute",
              orientation === "horizontal" 
                ? cn(
                    "left-1/2 transform -translate-x-1/2",
                    placement === "top" ? "bottom-[calc(100%_+_1.2rem)] pb-4" : "top-[calc(100%_+_1.2rem)] pt-4"
                  )
                : "left-full top-0 ml-4 pt-4"
            )}>
              <motion.div
                transition={transition}
                layoutId="active"
                className="bg-black/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              >
                <motion.div
                  layout // layout ensures smooth animation of children
                  className="w-max h-full p-4"
                >
                  {children}
                </motion.div>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const Menu = ({
  setActive,
  children,
  className,
}: {
  setActive: (item: string | null) => void;
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <nav
      onMouseLeave={() => setActive(null)} // resets the state
      className={cn(
        "relative rounded-full border border-transparent dark:bg-black dark:border-white/[0.2] bg-white shadow-input flex justify-center space-x-4 px-8 py-6",
        className
      )}
    >
      {children}
    </nav>
  );
};

export const ProductItem = ({
  title,
  description,
  href,
  src,
}: {
  title: string;
  description: string;
  href: string;
  src: string;
}) => {
  return (
    <Link href={href} className="flex space-x-2">
      <Image
        src={src}
        width={140}
        height={70}
        alt={title}
        className="flex-shrink-0 rounded-md shadow-2xl"
      />
      <div>
        <h4 className="text-xl font-bold mb-1 text-black dark:text-white">
          {title}
        </h4>
        <p className="text-neutral-700 text-sm max-w-[10rem] dark:text-neutral-300">
          {description}
        </p>
      </div>
    </Link>
  );
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const HoveredLink = ({ children, href = "#", ...rest }: any) => {
  return (
    <Link
      href={href}
      {...rest}
      className="text-neutral-700 dark:text-neutral-200 hover:text-black "
    >
      {children}
    </Link>
  );
};
