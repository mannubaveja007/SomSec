import { IsNotEmpty, IsString } from 'class-validator'

/**
 * Request DTO for smart contract analysis
 */
export class AnalyzeContractRequest {
    @IsString()
    @IsNotEmpty()
    contractCode!: string

    @IsString()
    @IsNotEmpty()
    contractName!: string
}
