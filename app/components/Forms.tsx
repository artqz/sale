import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useId, useState } from "react";
import { cn } from "~/utils/utils";
import { Label } from "./ui/Label";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import type { VariantProps } from "class-variance-authority";
import { Spinner } from "./Spinner";
import type { buttonVariants } from "./ui/buttonVariants";
import { Combobox } from "./ui/Combobox";

export type ListOfErrors = Array<string | null | undefined> | null | undefined;

export interface FormFieldProps {
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  inputProps: React.InputHTMLAttributes<HTMLInputElement>;
  errors?: ListOfErrors;
  className?: string;
}

export interface LoadingButtonProps
  extends React.ComponentProps<"button">,
  VariantProps<typeof buttonVariants> {
  buttonText: string;
  loadingText: string;
  isPending: boolean;
  className?: string;
}

export function ErrorList({
  id,
  errors,
}: {
  errors?: ListOfErrors;
  id?: string;
}) {
  const errorsToRender = errors?.filter(Boolean);
  if (!errorsToRender?.length) return null;
  return (
    <ul id={id} className="flex flex-col">
      {errorsToRender.map((e) => (
        <li key={e} className="text-destructive text-xs">
          {e}
        </li>
      ))}
    </ul>
  );
}

export function InputField({
  labelProps,
  inputProps,
  errors,
  className,
}: FormFieldProps) {
  const fallbackId = useId();
  const id = inputProps.id || fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <Input
        id={id}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
      />
      {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
    </div>
  );
}

type SelectFieldProps = {
  labelProps: React.LabelHTMLAttributes<HTMLLabelElement>;
  selectProps: React.SelectHTMLAttributes<HTMLSelectElement> & {
    placeholder?: string;
  };
  options: { value: string; label: string }[];
  errors?: string[];
  className?: string;
};

export function SelectField({
  labelProps,
  selectProps,
  options,
  errors,
  className,
}: SelectFieldProps) {
  const fallbackId = useId();
  const id = selectProps.id || fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}

      <select
        id={id}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          errorId && "border-destructive"
        )}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...selectProps}
      >
        {selectProps.placeholder && (
          <option value="" disabled>
            {selectProps.placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {errorId && <ErrorList id={errorId} errors={errors} />}
    </div>
  );
}

export function PasswordField({
  labelProps,
  inputProps,
  errors,
  className,
}: FormFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const fallbackId = useId();
  const id = inputProps.id || fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;
  const { type, ...restInputProps } = inputProps;

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <div className="relative">
        <Input
          id={id}
          className="pr-9"
          type={isVisible ? "text" : "password"}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          {...restInputProps}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setIsVisible(!isVisible)}
          className="absolute inset-y-0 right-0 flex h-full items-center justify-center pr-3 text-muted-foreground/80 hover:bg-transparent"
          aria-label={isVisible ? "Hide password" : "Show password"}
          tabIndex={-1}
        >
          {isVisible ? (
            <EyeOffIcon size={16} aria-hidden="true" />
          ) : (
            <EyeIcon size={16} aria-hidden="true" />
          )}
        </Button>
      </div>
      {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
    </div>
  );
}

export function LoadingButton({
  buttonText,
  loadingText,
  isPending,
  className = "",
  ...props
}: LoadingButtonProps) {
  return (
    <Button type="submit" className={className} disabled={isPending} {...props}>
      {isPending ? (
        <>
          <Spinner /> {loadingText}
        </>
      ) : (
        buttonText
      )}
    </Button>
  );
}


export interface ComboboxFieldProps {
  labelProps?: React.LabelHTMLAttributes<HTMLLabelElement>;
  comboboxProps: {
    options: { value: string; label: string }[];
    name: string;
    value: string;
    onInput: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    // Другие атрибуты
    autoComplete?: string;
    enterKeyHint?: 'enter' | 'done' | 'go' | 'next' | 'previous' | 'search' | 'send';
  };
  errors?: string[] | null;
  className?: string;
}

export function ComboboxField({
  labelProps,
  comboboxProps,
  errors,
  className,
}: ComboboxFieldProps) {
  const fallbackId = useId();
  const id = comboboxProps.name || fallbackId;
  const errorId = errors?.length ? `${id}-error` : undefined;

  return (
    <div className={cn(className, "flex flex-col gap-2")}>
      {labelProps && <Label htmlFor={id} {...labelProps} />}
      <Combobox
        {...comboboxProps}
      // Передаём id, чтобы label привязывался
      // (необязательно, но полезно для доступности)
      // Можно добавить в Combobox пропс `id`, если нужно
      />
      {errorId ? <ErrorList id={errorId} errors={errors} /> : null}
    </div>
  );
}