import { UntilService } from "@/common";
import { Ticket } from "@/database/entities";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { TicketRequest, TicketResponse } from "./dto";
import { BaseQuery, NormalResponse } from "@/shared";
import { plainToInstance } from "class-transformer";

@Injectable()
export class TicketsService {
  constructor(
    private readonly logger: Logger,
    private readonly util: UntilService,
    @InjectRepository(Ticket)
    private readonly ticketRepository: Repository<Ticket>,
  ) {}

  public async save(json: TicketRequest): Promise<NormalResponse> {
    try {
      const newTicket = this.ticketRepository.create({
        ...json,
      });

      await this.ticketRepository.save(newTicket);

      return this.util.buildCreatedResponse("Created successfully!");
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  public async findAll(query: BaseQuery) {
    const { limit, page } = query;

    const [tickets, total] = await this.ticketRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = {
      page,
      limit,
      size: total,
      totalPage: Math.ceil(total / limit),
      result: plainToInstance(TicketResponse, tickets),
    };

    return this.util.buildSuccessResponse(result);
  }

  public async findOne(ticketId: string): Promise<NormalResponse> {
    try {
      const existingTicket = await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
      });

      if (!existingTicket) throw new BadRequestException("Ticket not found!");

      return this.util.buildSuccessResponse(
        plainToInstance(TicketResponse, existingTicket),
      );
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  public async findOneByCode(code: string): Promise<NormalResponse> {
    try {
      const existingTicket = await this.ticketRepository.findOne({
        where: {
          code,
        },
      });

      if (!existingTicket) throw new BadRequestException("Ticket not found!");

      return this.util.buildSuccessResponse(
        plainToInstance(TicketResponse, existingTicket),
      );
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  public async update(
    ticketId: string,
    json: TicketRequest,
  ): Promise<NormalResponse> {
    try {
      const existingTicket = await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
      });

      if (!existingTicket) throw new BadRequestException("Ticket not found!");

      await this.ticketRepository.update(existingTicket.id, {
        ...json,
      });

      return this.util.buildSuccessResponse("Updated successfully!");
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  public async checkExpireTicket() {
    try {
      const expiredTickets = await this.ticketRepository.find({
        where: {
          endAt: LessThan(new Date()),
          idExpired: false,
        },
      });

      if (expiredTickets.length > 0) {
        const updatePromises = expiredTickets.map((ticket) => {
          ticket.idExpired = true;
          return this.ticketRepository.save(ticket);
        });

        await Promise.all(updatePromises);
      }
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }

  public async remove(ticketId: string): Promise<NormalResponse> {
    try {
      const existingTicket = await this.ticketRepository.findOne({
        where: {
          id: ticketId,
        },
      });

      if (!existingTicket) throw new BadRequestException("Ticket not found!");

      await this.ticketRepository.softDelete(existingTicket.id);

      return this.util.buildSuccessResponse("Deleted successfully!");
    } catch (err) {
      this.logger.error(err);
      throw new BadRequestException(err);
    }
  }
}
