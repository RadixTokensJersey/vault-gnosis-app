import { AllocationInput } from "./types";
import readXlsxFile from 'read-excel-file'
const { default: BigNumber } = require('bignumber.js')

export const readAllocationsFromExcel = async (file) => {
    let totalAmount = new BigNumber(0)

    const addresses: string[] = []
    const amounts: number[] = []
    const groups: number[] = []

    let rows

    rows = await readXlsxFile(file)

    for (let row of rows) {
        if (row[0] === 'Contributor ID') {
            continue
        }

        const address: string = row[1]
        let totalString = row[2].toString()
        const total = new BigNumber(totalString).multipliedBy(new BigNumber(10).pow(new BigNumber(18)))

        addresses.push(address)
        amounts.push(total)
        groups.push(0)

        totalAmount = totalAmount.plus(total)
    }

    // await token.increaseAllowance(Vault.address, totalAmount, { from: owner })
    // await vault.setFundingAccount(owner, { from: owner })

    // await vault.addGroup(`Genesis Group`, { from: owner })

    let addressBatches: string[][] = []
    let amountBatches: number[][] = []
    let groupBatches: number[][] = []

    const batchSize = 50
    const count = addresses.length
    const nbrOfBatches = Math.ceil(count / batchSize)

    let allocationNbr = 0

    let txs: AllocationInput[] = []

    for (let batchNbr = 0; batchNbr < nbrOfBatches; batchNbr++) {
        addressBatches[batchNbr] = []
        amountBatches[batchNbr] = []
        groupBatches[batchNbr] = []

        for (
            let _allocationNbr = allocationNbr;
            batchSize * (batchNbr + 1) < count ? _allocationNbr < (batchSize * (batchNbr + 1)) : _allocationNbr < count;
            _allocationNbr++
        ) {
            addressBatches[batchNbr].push(addresses[_allocationNbr])
            amountBatches[batchNbr].push(amounts[_allocationNbr])
            groupBatches[batchNbr].push(groups[_allocationNbr])
            allocationNbr++
        }

        txs.push(
            {
                addresses: addressBatches[batchNbr],
                amounts: amountBatches[batchNbr],
                groups: groupBatches[batchNbr]
            }
        )

        /*
        console.log(`--------- TRANSACTION ${batchNbr} --------------`)
        console.log(vault.methods.addAllocations(
            addressBatches[batchNbr],
            amountBatches[batchNbr],
            groupBatches[batchNbr]
        ).encodeABI())
        console.log('------------------------------------------------')
        */
    }

    return txs
}
