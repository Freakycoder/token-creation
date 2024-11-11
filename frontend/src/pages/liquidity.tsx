import { PlusCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useCallback, useState } from "react"
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
import { ConnectionProvider, WalletProvider, useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { clusterApiUrl } from "@solana/web3.js";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import {useSolanaPrograms} from '../lib/Solana'

const liquidity = () => {

    interface token {
        name: string,
        decimal: number
    }
    const { program, wallet } = useSolanaPrograms();

    if (!wallet.connected){
        console.log("Wallet not connected");
        return
    }

    const [baseToken, setBaseToken] = useState<token>();
    const [baseSelectedToken, setBaseSelectedToken] = useState('USDC');
    const [baseQouteToken, setBaseQuoteToken] = useState('USDC');

    const BaseHandler = useCallback((token: string) => {
        setBaseSelectedToken(token);
    }, []);

    const QuoteHandler = useCallback((token: string) => {
        setBaseQuoteToken(token);
    }, []);

    const initialize_mint = () => {
        try{
            await program.methods.
        }catch(e){

        }
    }

    return <div className="w-screen h-screen grid grid-cols-2">
        <div className="col-span-1 flex items-center justify-center">
            <div className="border-black border-2 p-6 w-auto h-auto rounded-2xl flex flex-col items-center gap-y-2">
                <h1>Initial Liquidity</h1>
                <div className="bg-zinc-700 min-w-sm rounded-xl ">
                    <div className="bg-transparent flex items-center justify-between w-80 p-2 rounded-t-xl ">
                        <div>
                            <h2>Base Token</h2>
                        </div>
                        <div>
                            <button className="rounded-lg border-2 border-black">
                                Max %
                            </button>
                            <button className="rounded-lg border-2 border-black">
                                50 %
                            </button>
                        </div>
                    </div>
                    <div className="bg-slate-400 rounded-xl p-2 flex justify-between">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default">{baseSelectedToken}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel >Choose Token</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => BaseHandler('SOL')} className="text-black">
                                        <CupSoda></CupSoda>
                                        SOL
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => BaseHandler('BTC')} className="text-black">
                                        <CupSoda></CupSoda>
                                        BTC
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => BaseHandler('ETH')} className="text-black">
                                        <CupSoda></CupSoda>
                                        ETH
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => BaseHandler('AVAX')} className="text-black">
                                        <CupSoda></CupSoda>
                                        AVAX
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Input className="rounded-xl bg-transparent text-xl text-black" type="number" placeholder="enter the amount"></Input>
                    </div>
                </div>
                <PlusCircle></PlusCircle>
                <div className="bg-zinc-700 min-w-sm rounded-xl ">
                    <div className="bg-transparent flex items-center justify-between w-80 p-2 rounded-t-xl ">
                        <div>
                            <h2>Base Token</h2>
                        </div>
                        <div>
                            <button className="rounded-lg border-2 border-black">
                                Max %
                            </button>
                            <button className="rounded-lg border-2 border-black">
                                50 %
                            </button>
                        </div>
                    </div>
                    <div className="bg-slate-400 rounded-xl p-2 flex justify-between">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default">{baseQouteToken}</Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-56">
                                <DropdownMenuLabel >Choose Token</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={() => QuoteHandler('SOL')} className="text-black">
                                        <CupSoda></CupSoda>
                                        SOL
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => QuoteHandler('BTC')} className="text-black">
                                        <CupSoda></CupSoda>
                                        BTC
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => QuoteHandler('ETH')} className="text-black">
                                        <CupSoda></CupSoda>
                                        ETH
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => QuoteHandler('AVAX')} className="text-black">
                                        <CupSoda></CupSoda>
                                        AVAX
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Input className="rounded-xl bg-transparent text-xl text-black" type="number" placeholder="enter the amount"></Input>
                    </div>
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label htmlFor="email">Total</Label>
                    <Input type="number" id="email" />
                </div>
                <button className="bg-teal-600 rounded-xl w-100% p-2 ">
                    Initialize liquidity pool
                </button>
            </div>
        </div>
        <div className="col-span-1 flex items-center justify-center">
            <div className=" max-w-lg rounded-xl h-auto">
                <h1>How To Create a Liquidity Pool</h1>
                <p> Select the token that you just created.

                    Enter the amount tokens you would like to include in your liquidity pool. (Recommended 95% or more)<br></br>

                    Select a base token, SOL is recommended.<br></br>

                    Enter the amount of SOL you would like to pair with your token. (Recommended 10+ SOL)<br></br>

                    Select your LP fees. This is a small amount of each transaction that goes back to growing your tokens liquidity pool. (Recommended 0.25%)<br></br>

                    Click “Initialize Liquidity Pool” and approve transaction. The cost to create a liquidity pool is .5 SOL.<br></br>

                    In return, you will receive Liquidity pool tokens. To burn liquidity so it shows locked, head to <a> www.google.com</a> <br></br>

                    Note: The amount of SOL you enter as your starting LP determines the starting price of your token</p>
            </div>
        </div>
    </div>
}

export default liquidity;