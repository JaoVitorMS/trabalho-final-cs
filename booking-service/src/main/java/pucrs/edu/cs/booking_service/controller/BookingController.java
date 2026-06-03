package pucrs.edu.cs.booking_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import pucrs.edu.cs.booking_service.model.Reserva;
import pucrs.edu.cs.booking_service.service.ReservaService;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final ReservaService reservaService;

    @PostMapping
    public ResponseEntity<Reserva> reservar(@RequestBody Reserva reserva) {
        return ResponseEntity.ok(reservaService.reservar(reserva));
    }

    @GetMapping
    public ResponseEntity<List<Reserva>> listarTodas() {
        return ResponseEntity.ok(reservaService.listarTodas());
    }
}
