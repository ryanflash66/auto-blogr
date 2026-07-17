import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, Label } from 'autoblogr'

// input-otp's OTPInput seeds its internal state from `defaultValue`, so the
// slots paint their characters without a controlled value/onChange pair.
export const WithValue = () => (
  <div className="grid gap-2">
    <Label>Verification code</Label>
    <InputOTP maxLength={6} defaultValue="418290">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
    <p className="text-sm text-muted-foreground">
      Enter the 6-digit code we emailed to confirm this WordPress connection.
    </p>
  </div>
)

export const Empty = () => (
  <div className="grid gap-2">
    <Label>Verification code</Label>
    <InputOTP maxLength={6}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  </div>
)

export const WithSeparator = () => (
  <div className="grid gap-2">
    <Label>Two-factor code</Label>
    <InputOTP maxLength={6} defaultValue="418290">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  </div>
)

export const Disabled = () => (
  <div className="grid gap-2">
    <Label>Verification code</Label>
    <InputOTP maxLength={6} defaultValue="418290" disabled>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
    <p className="text-sm text-muted-foreground">Code accepted — site connected.</p>
  </div>
)
