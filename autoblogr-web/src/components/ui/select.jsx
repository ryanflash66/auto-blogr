// Select Component Stub
import React from "react";

export const Select = ({ children, ...props }) => (
  <select {...props}>{children}</select>
);

export const SelectContent = ({ children }) => <>{children}</>;
export const SelectItem = ({ children, value }) => (
  <option value={value}>{children}</option>
);
export const SelectTrigger = ({ children }) => <>{children}</>;
export const SelectValue = ({ placeholder }) => (
  <option value="">{placeholder}</option>
);
