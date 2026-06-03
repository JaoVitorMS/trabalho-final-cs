package pucrs.edu.cs.booking_service.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_RESERVA_CRIADA = "reserva.criada.queue";
    public static final String EXCHANGE_RESERVA = "reserva.exchange";
    public static final String ROUTING_KEY_RESERVA_CRIADA = "reserva.criada.key";

    @Bean
    public Queue reservaCriadaQueue() {
        return new Queue(QUEUE_RESERVA_CRIADA, true);
    }

    @Bean
    public DirectExchange reservaExchange() {
        return new DirectExchange(EXCHANGE_RESERVA);
    }

    @Bean
    public Binding bindingReservaCriada(Queue reservaCriadaQueue, DirectExchange reservaExchange) {
        return BindingBuilder.bind(reservaCriadaQueue).to(reservaExchange).with(ROUTING_KEY_RESERVA_CRIADA);
    }
}
