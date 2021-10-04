import {
	DelegateChanged,
	DelegateVotesChanged,
} from '../../generated/schema'

import {
	DelegateChanged       as DelegateChangedEvent,
	DelegateVotesChanged  as DelegateVotesChangedEvent,
} from '../../generated/voting/Voting'

import {
// 	constants,
	decimals,
	events,
	transactions,
} from '@amxx/graphprotocol-utils'

import {
	fetchAccount,
} from '../fetch/account'

import {
	fetchVoting,
	fetchDelegation,
	fetchWeight,
} from '../fetch/voting'

export function handleDelegateChanged(event: DelegateChangedEvent): void {
	const delegator    = fetchAccount(event.params.delegator)
	const fromDelegate = fetchAccount(event.params.fromDelegate)
	const toDelegate   = fetchAccount(event.params.toDelegate)
	const contract     = fetchVoting(event.address)
	const delegation   = fetchDelegation(contract, delegator)

	delegation.delegatee = toDelegate.id

	delegation.save()
	contract.save()

	let ev          = new DelegateChanged(events.id(event))
	ev.transaction  = transactions.log(event).id
	ev.timestamp    = event.block.timestamp
	ev.delegation   = delegation.id
	ev.contract     = contract.id
	ev.delegator    = delegator.id
	ev.fromDelegate = fromDelegate.id
	ev.toDelegate   = toDelegate.id
	ev.save()
}

export function handleDelegateVotesChanged(event: DelegateVotesChangedEvent): void {
	const delegate = fetchAccount(event.params.delegate)
	const contract = fetchVoting(event.address)
	const weigth   = fetchWeight(contract, delegate)

	weigth.value = event.params.newBalance


	weigth.save()
	contract.save()

	let ev         = new DelegateVotesChanged(events.id(event))
	ev.transaction = transactions.log(event).id
	ev.timestamp   = event.block.timestamp
	ev.voteWeight  = weigth.id
	ev.contract    = contract.id
	ev.delegate    = delegate.id
	ev.oldValue    = event.params.previousBalance
	ev.newValue    = event.params.newBalance
	ev.save()
}
