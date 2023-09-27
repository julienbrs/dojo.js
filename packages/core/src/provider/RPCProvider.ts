import { RpcProvider, Account, num, InvokeFunctionResponse, Contract, Result, shortString } from "starknet";
import { Provider } from "./provider";
import { Query, WorldEntryPoints } from "../types";
import { LOCAL_KATANA } from '../constants';
import abi from '../constants/abi.json';

/**
 * RPCProvider class: Extends the generic Provider to handle RPC interactions.
 */
export class RPCProvider extends Provider {
    public provider: RpcProvider;
    public contract: Contract

    /**
     * Constructor: Initializes the RPCProvider with the given world address and URL.
     * 
     * @param {string} world_address - Address of the world.
     * @param {string} [url=LOCAL_KATANA] - RPC URL (defaults to LOCAL_KATANA).
     */
    constructor(world_address: string, url: string = LOCAL_KATANA) {
        super(world_address);
        this.provider = new RpcProvider({
            nodeUrl: url,
        });
        this.contract = new Contract(abi, this.getWorldAddress(), this.provider);
    }

    /**
     * Retrieves a single entity's details.
     * 
     * @param {string} component - The component to query.
     * @param {Query} query - The query details.
     * @param {number} [offset=0] - Starting offset (defaults to 0).
     * @param {number} [length=0] - Length to retrieve (defaults to 0).
     * @returns {Promise<Array<bigint>>} - A promise that resolves to an array of bigints representing the entity's details.
     */
    public async entity(component: string, query: Query, offset: number = 0, length: number = 0): Promise<Array<bigint>> {
        try {
            return await this.contract.call(WorldEntryPoints.get, [
                shortString.encodeShortString(component),
                query.keys.length,
                ...query.keys as any,
                offset,
                length
            ]) as unknown as Array<bigint>;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves multiple entities' details.
     * 
     * @param {string} component - The component to query.
     * @param {number} length - Number of entities to retrieve.
     * @returns {Promise<Array<bigint>>} - A promise that resolves to an array of bigints representing the entities' details.
     */
    public async entities(component: string, length: number): Promise<Array<bigint>> {
        try {
            return await this.contract.call(WorldEntryPoints.entities, [shortString.encodeShortString(component), length]) as unknown as Array<bigint>;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Retrieves a component's details.
     * 
     * @param {string} name - Name of the component.
     * @returns {Promise<bigint>} - A promise that resolves to a bigint representing the component's details.
     */
    public async component(name: string): Promise<bigint> {
        try {
            return await this.contract.call(WorldEntryPoints.component, [shortString.encodeShortString(name)]) as unknown as bigint;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Executes a function with the given parameters.
     * 
     * @param {Account} account - The account to use.
     * @param {string} contract - The contract to execute.
     * @param {string} call - The function to call.
     * @param {num.BigNumberish[]} call_data - The call data for the function.
     * @returns {Promise<InvokeFunctionResponse>} - A promise that resolves to the response of the function execution.
     */
    public async execute(account: Account, contract: string, call: string, call_data: num.BigNumberish[]): Promise<InvokeFunctionResponse> {
        try {
            const nonce = await account?.getNonce()

            return await account?.execute(
                {
                    contractAddress: contract,
                    entrypoint: call,
                    calldata: [this.getWorldAddress()!, ...call_data]
                },
                undefined,
                {
                    nonce,
                    maxFee: 0 // TODO: Update this value as needed.
                }
            );
        } catch (error) {
            throw error;
        }
    }

    /**
     * Calls a function with the given parameters.
     * 
     * @param {string} selector - The selector of the function.
     * @param {num.BigNumberish[]} call_data - The call data for the function.
     * @returns {Promise<CallContractResponse>} - A promise that resolves to the response of the function call.
     * @throws {Error} - Throws an error if the call fails.
     * 
     * @example
     * const response = await provider.call("position", [1, 2, 3]);
     * console.log(response.result);
     * // => 6
     * 
     */
    public async call(selector: string, call_data: num.BigNumberish[]): Promise<Result> {
        try {
            return await this.contract.call(WorldEntryPoints.execute, [shortString.encodeShortString(selector), call_data]);
        } catch (error) {
            throw error;
        }
    }
}