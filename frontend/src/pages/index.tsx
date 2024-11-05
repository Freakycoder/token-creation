import { useState, FormEvent } from 'react';
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Upload } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Separator } from "@/components/ui/separator"


const Home: React.FC = () => {
  const [tokenName, setTokenName] = useState<string>('');
  const [tokenSymbol, setTokenSymbol] = useState<string>('');
  const [totalSupply, setTotalSupply] = useState<number | ''>('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    console.log('Token Details:', {
      tokenName,
      tokenSymbol,
      totalSupply,
    });

    setTokenName('');
    setTokenSymbol('');
    setTotalSupply('');
  };

  return (
    <div className='grid grid-cols-2 w-screen h-screen scroll-smooth'>
      <div className='flex flex-col col-span-1 items-center justify-center p-4 h-auto'>
        <div className='border-white border-2 p-6 rounded-xl'>
          <form onSubmit={handleSubmit} className='w-full max-w-sm'>
            <div className='flex flex-col space-y-6'>
              <div className='flex space-x-4 mb-2'>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Name</Label>
                  <Input type="email" id="email" placeholder="Token Name" />
                </div>
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="email">Symbol</Label>
                  <Input type="email" id="email" placeholder="Eg. BTC, ETH, SOL" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">

                <div className="space-y-2">
                  <div>
                    <Label htmlFor="decimals">Decimals</Label>
                    <Input
                      type="number"
                      id="decimals"
                      placeholder="Enter decimals"
                      className="w-full"
                    />
                  </div>

                  <div >
                    <Label htmlFor="supply">Supply</Label>
                    <Input
                      type="number"
                      id="supply"
                      placeholder="Enter supply"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* coloumn for image */}
                <div >
                  <Label htmlFor="image">Image</Label>
                  <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center  min-h-[105px]">

                    <Input
                      type="file"
                      id="image"
                      className="hidden"
                    />
                    <label
                      htmlFor="image"
                      className="cursor-pointer text-sm text-gray-400 hover:text-gray-300"
                    >
                      <Upload className='w-8 h-8'></Upload>
                    </label>
                  </div>
                </div>
              </div>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="email">Description</Label>
                <Input className='min-h-[100px]' type="description" id="description" placeholder="What is the token for?" />
              </div>
              <button type="submit" className='bg-blue-500 text-white p-2 rounded-2xl'>Create Token</button>
            </div>
          </form>
        </div>
        {/* bottom div for left side */}
        <div className='mt-10 border-white border-2 p-6 rounded-2xl'>
          <div className='flex flex-col items-start space-y-4 max-w-sm'>
            <h1 className='text-2xl'>Revoke Mint Authority</h1>
            <p>Revoking mint authority ensures that there can be no more tokens minted than the total supply. This provides security and peace of mind to buyers.</p>
            <div className='w-full'>
              <Input
                type="search"
                id="supply"
                placeholder="Select Token"
                className="w-full"
              />
            </div>
            <button type="submit" className='bg-blue-500 text-white w-full p-2 rounded-2xl'>Confirm</button>
          </div>
        </div>
      </div>
      {/* right side */}
      <div className='flex flex-col col-span-1 items-center justify-center p-4 h-auto'>

        <div className='max-w-sm flex flex-col space-y-4'>

          <h1 className='text-2xl'>Create Solana Token</h1>
          <p>Effortlessly create your Solana SPL Token with our 7+1 step process – no coding required.</p>
          <p>Customize your Solana Token exactly the way you envision it. Less than 5 minutes, at an affordable cost.</p>
          <h1 className='text-2xl'>How to use Solana Token Creator</h1>
          <p className=''>
            1. Connect your Solana wallet. <br></br>

            2. Specify the desired name for your Token<br></br>

            3. Indicate the symbol (max 8 characters).<br></br>

            4. Select the decimals quantity (5 for utility Token, 9 for meme token).<br></br>

            5. Provide a brief description for your SPL Token.<br></br>

            6. Upload the image for your token (PNG).<br></br>

            7. Determine the Supply of your Token.<br></br>

            8. Click on create, accept the transaction and wait until your tokens ready.<br></br>

            The cost of Token creation is 0.5 SOL, covering all fees for SPL Token Creation.
          </p>
          <h1 className='text-2xl'>Revoke Freeze Authority:</h1>
          <p>If you want to create a liquidity pool you will need to "Revoke Freeze Authority" of the Token, you can do that here. The cost is 0.1 SOL.</p>
          <h1 className='text-2xl'>Revoke Mint Authority:</h1>
          <p>Revoking mint authority ensures that there can be no more tokens minted than the total supply. This provides security and peace of mind to buyers. The cost is 0.1 SOL</p>
          <p>Once the creation process starts, it will only take a few seconds! Once complete, you will receive the total supply of the token in your wallet.<br></br>

            With our user-friendly platform, managing your tokens is simple and affordable. Using your wallet, you can easily create tokens, increase their supply, or freeze them as needed. Discover the ease of Solana Token creation with us<br></br>

            You can choose to revoke mint authority later if you choose</p>
        </div>
      </div>
      <div className='w-full h-auto ml-28'>
        <h1 className='text-4xl mb-4'>Frequently Asked Questions</h1>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger className='text-xl mb-2'>What is the Solana Token Creator</AccordionTrigger>
            <AccordionContent className=' mb-2'>
              The Solana Token Creator is an advanced Smart Contract empowering users to effortlessly generate customized SPL Tokens (Solana tokens), specifically tailored to their preferences in terms of supply, name, symbol, description, and image on the Solana Chain. Making tokens is super quick and cheap with our easy process.
            </AccordionContent>
          </AccordionItem>
          <Separator className="my-2 bg-white border-1 border-gray-400"/>
          <AccordionItem value="item-2">
            <AccordionTrigger className='text-xl mb-2'>Is it Safe to Create Solana Tokens here?</AccordionTrigger>
            <AccordionContent className=' mb-2'>
              Yes, our tools is completely safe. It is a dApp that creates your token, giving you and only you the mint and freeze Authority (the control of a SPL Token). Our dApp is audited and used by hundred of users every month.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className='text-xl mb-2'>How much time will the Solana Token Creator Take?</AccordionTrigger>
            <AccordionContent className=' mb-2'>
              The time of your Token Creation depends on the TPS Status of Solana. It usually takes just a few seconds so do not worry. If you have any issue please contact us
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger className='text-xl mb-2'>How much does it cost?</AccordionTrigger>
            <AccordionContent className=' mb-2'>
              The token creation currently cost 0.5 Sol, it includes all fees necessaries for the Token Creation in Solana mainnet.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-5">
            <AccordionTrigger className='text-xl mb-2'>Which wallet can I use?</AccordionTrigger>
            <AccordionContent className=' mb-2'>
              You can use any Solana Wallet as Phantom, Solflare, Backpack, etc.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-6">
            <AccordionTrigger className='text-xl mb-2'>How many tokens can I create for each decimal amount?</AccordionTrigger>
            <AccordionContent className=' mb-2'>
              Here is the max amount of tokens you can create for each decimal range.<br></br>

              0 to 4 - 1,844,674,407,370,955<br></br>
              5 to 7 - 1,844,674,407,370<br></br>
              8 - 184,467,440,737<br></br>
              9 - 18,446,744,073
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default Home;
