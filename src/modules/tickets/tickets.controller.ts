import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TicketsService } from "./tickets.service";

@Controller("tickets")
@ApiTags("Ticket")
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}
}
