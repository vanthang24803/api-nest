import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { TicketsService } from "./tickets.service";
import { BaseQuery } from "@/shared";
import { TicketRequest } from "./dto";

@Controller("tickets")
@ApiTags("Ticket")
export class TicketsController {
  constructor(private readonly ticketService: TicketsService) {}

  @Get()
  public async findAllTickets(@Query() query: BaseQuery) {
    return this.ticketService.findAll(query);
  }

  @Get(":id")
  public async findOneTicket(@Param("id") ticketId: string) {
    return this.ticketService.findOne(ticketId);
  }

  @Post()
  public async createTicket(@Body() request: TicketRequest) {
    return this.ticketService.save(request);
  }

  @Put(":id")
  public async updateTicket(
    @Param("id") ticketId: string,
    @Body() request: TicketRequest,
  ) {
    return this.ticketService.update(ticketId, request);
  }

  @Delete(":id")
  public async removeTicket(@Param("id") ticketId: string) {
    return this.ticketService.remove(ticketId);
  }
}
