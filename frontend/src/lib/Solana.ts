import { PublicKey } from '@solana/web3.js';
import { useConnection, useWallet, WalletContextState } from '@solana/wallet-adapter-react';
import { AnchorProvider, Program, Idl } from '@project-serum/anchor'
import IDL from '../../../target/idl/token_creation.json'

const programID = new PublicKey(IDL.address);

export const useSolanaPrograms = () => {

    const { connection } = useConnection();
    const wallet = useWallet();

    const provider = new AnchorProvider(connection,
        {
            publicKey: wallet.publicKey!,
            signTransaction: wallet.signTransaction!,
            signAllTransactions: wallet.signAllTransactions!
        }
        , {
            preflightCommitment: 'processed',
        })

    type ProgramInstructions = typeof IDL.instructions[number]['name'];

    // Define program type
    type TokenProgram = Program<Idl> & {
        methods: {
            [K in ProgramInstructions]: (...args: any[]) => any;
        }
    };

    const program = new Program(IDL as Idl, programID, provider)

    return {
        program,
        connection,
        wallet,
        provider
    }
}
