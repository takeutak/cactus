package com.accenture.interoperability.flows

import co.paralleluniverse.fibers.Suspendable
import net.corda.core.flows.*
import net.corda.core.identity.CordaX500Name
import net.corda.core.utilities.unwrap

@InitiatingFlow
@StartableByRPC
@StartableByService
class EchoFlow(private val text: String, private val counterPartyName: CordaX500Name) : FlowLogic<String>() {

    @Suspendable
    override fun call(): String {
        val counterParty = serviceHub.identityService.wellKnownPartyFromX500Name(counterPartyName)
                ?: error("failed to find $counterPartyName")
        val session = initiateFlow(counterParty)
        session.send(text)
        return session.receive<String>().unwrap { it }
    }
}

@InitiatedBy(EchoFlow::class)
class EchoResponder(private val session: FlowSession) : FlowLogic<Unit>() {

    @Suspendable
    override fun call() {
        val text = session.receive<String>().unwrap { it }
        session.send("Echo: $text")
    }
}
