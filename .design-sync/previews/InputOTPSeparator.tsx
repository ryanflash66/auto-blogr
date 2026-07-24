import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot, Label } from 'autoblogr'

// InputOTPSeparator is a sub-part: alone it renders a lone Minus icon with no
// context. The only honest preview composes it inside a full InputOTP, between
// two InputOTPGroups.
export const BetweenTwoGroups = () => (
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
    <p className="text-sm text-muted-foreground">
      Split the passcode into readable chunks — the separator is decorative.
    </p>
  </div>
)

export const MultipleSeparators = () => (
  <div className="grid gap-2">
    <Label>Site pairing code</Label>
    <InputOTP maxLength={6} defaultValue="418290">
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={2} />
        <InputOTPSlot index={3} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  </div>
)
