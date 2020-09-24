package com.accenture.interoperability.flows

import io.cordite.braid.corda.BraidConfig
import net.corda.core.node.AppServiceHub
import net.corda.core.node.services.CordaService
import net.corda.core.serialization.SingletonSerializeAsToken

@CordaService
class BraidService(private val serviceHub: AppServiceHub) : SingletonSerializeAsToken() {

    init {
        val port = 8083;
        System.out.println("BraidService#init() Will expose HTTP port $port");
        System.err.println("BraidService#init() Will expose HTTP port $port");
        BraidConfig(port).bootstrap();
    }

    private fun BraidConfig.bootstrap() {
        this
                .withFlow("echoFlow", EchoFlow::class)
                .withFlow("echoResponder", EchoResponder::class)

//                .withFlow(GetAssetFlow::class)

//                .withFlow(CopyAssetFlow.Initiator::class)
//                .withFlow(CopyAssetFlow.Responder::class)
//
//                .withFlow(CreateActorFlow.Initiator::class)
//                .withFlow(CreateActorFlow.Responder::class)
//
//                .withFlow(CreateAssetFlow.Initiator::class)
//                .withFlow(CreateAssetFlow.Responder::class)
//
//                .withFlow(LockAssetFlow.Initiator::class)
//                .withFlow(LockAssetFlow.Responder::class)
//
//                .withFlow(VerifySignedMessageFlow.Initiator::class)
//                .withFlow(VerifySignedMessageFlow.Responder::class)

                .bootstrapBraid(serviceHub)
    }
}
