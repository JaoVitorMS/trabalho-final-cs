package pucrs.edu.cs.booking_service.producer;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;
import pucrs.edu.cs.booking_service.config.RabbitMQConfig;
import pucrs.edu.cs.booking_service.model.Reserva;

@Component
@RequiredArgsConstructor
public class ReservaProducer {

    private final RabbitTemplate rabbitTemplate;

    public void enviarEventoReservaCriada(Reserva reserva) {
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE_RESERVA,
                RabbitMQConfig.ROUTING_KEY_RESERVA_CRIADA,
                reserva.toString() // Simplificado para fins de exemplo
        );
    }
}
