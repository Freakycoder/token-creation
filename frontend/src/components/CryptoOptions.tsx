import { Button } from "@/components/ui/button"
import { CupSoda } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useState, useCallback } from "react";

export function CryptoDropdown() {
  const [selectedToken, setSelectedToken] = useState('USDC');

  const handler = useCallback((token: string) => {
    setSelectedToken(token);
  }, [selectedToken]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default">{selectedToken}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel >Choose Token</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => handler('SOL')} className="text-black">
            <CupSoda></CupSoda>
            SOL
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handler('BTC')} className="text-black">
            <CupSoda></CupSoda>
            BTC
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handler('ETH')} className="text-black">
            <CupSoda></CupSoda>
            ETH
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handler('AVAX')} className="text-black">
            <CupSoda></CupSoda>
            AVAX
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
