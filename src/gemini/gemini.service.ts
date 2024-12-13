import { Injectable, Logger } from "@nestjs/common";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GeminiService {
  private readonly gemini: any;
  private readonly geminiModel: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.gemini = new GoogleGenerativeAI(
      this.configService.getOrThrow<string>("GEMINI_SECRET_KEY"),
    );
    this.geminiModel = this.gemini.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
  }
}
