import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma/prisma.service";
import * as argon from "argon2";
import { AppModule } from "src/app.module";
import { AuthDto, TokensDto } from "src/auth/dto";
import {
  ConflictException,
  ForbiddenException,
  UnauthorizedException,
} from "@nestjs/common";

describe("AuthService", () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
      providers: [AuthService, PrismaService, JwtService],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe("register", () => {
    it("should register a new user and returns token", async () => {
      const dto: AuthDto = {
        email: "testpick@aaa.com",
        password: "56",
        name: "testUser",
        role: "user",
      };
      const hashedPassword = await argon.hash(dto.password);

      prisma.user.findUnique = jest.fn().mockResolvedValue(null);
      prisma.user.create = jest.fn().mockResolvedValue({
        id: 1,
        ...dto,
        password: hashedPassword,
      });
      jwtService.signAsync = jest.fn().mockResolvedValue("accessToken");

      const tokens = await service.register(dto);

      expect(tokens).toHaveProperty("accessToken");
      expect(tokens).toHaveProperty("refreshToken");
    });

    it("should throw conflictException if user already exists", async () => {
      const dto: AuthDto = {
        email: "testpick@aaa.com",
        password: "56",
        name: "testUser",
        role: "user",
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: dto.email,
      });

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should login a user and returns tokens", async () => {
      const dto: AuthDto = {
        email: "testpick@aaa.com",
        password: "56",
      };
      const hashedPassword = await argon.hash(dto.password);

      const user = {
        id: 1,
        email: dto.email,
        password: hashedPassword,
        role: "user",
      };

      prisma.user.findUnique = jest.fn().mockResolvedValue(user);
      jest.spyOn(argon, "verify").mockResolvedValue(true);
      jwtService.signAsync = jest.fn().mockResolvedValue("accessToken");
      service["hashedPassword"] = jest.fn().mockResolvedValue(undefined);

      const tokens = await service.login(dto);

      expect(tokens).toHaveProperty("accessToken");
      expect(tokens).toHaveProperty("refreshToken");
    });

    it("should throw ForbiddenException if credentials are invalid", async () => {
      const dto: AuthDto = {
        email: "testpick@aaa.com",
        password: "58",
      };
      prisma.user.findUnique = jest.fn().mockResolvedValue({
        id: 1,
        email: dto.email,
        password: await argon.hash("password"),
        role: "user",
      });
      jest.spyOn(argon, "verify").mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(ForbiddenException);
    });
  });

  describe("logout", () => {
    it("should logout a user by clearing the refresh token", async () => {
      prisma.user.updateMany = jest.fn().mockResolvedValue({
        count: 1,
      });

      await expect(service.logout(1)).resolves.not.toThrow();
    });

    it("should throw an error if the logout operation fails", async () => {
      prisma.user.updateMany = jest
        .fn()
        .mockRejectedValue(new Error("Database error"));

      await expect(service.logout(1)).rejects.toThrow("Logout failed");
    });
  });

  describe("forgetPassword", () => {
    it("should generate a reset token and update user", async () => {
      const email = "testpick@aaa.com";
      const user = { id: 1, email };
      const resetToken = "resetToken";

      prisma.user.findUnique = jest.fn().mockResolvedValue(user);
      service["generateResetToken"] = jest.fn().mockReturnValue(resetToken);
      jest.spyOn(argon, "hash").mockResolvedValue("hashedResetToken");
      prisma.user.update = jest.fn().mockResolvedValue({ id: 1 });

      const result = await service.forgetPassword(email);

      expect(result.resetToken).toEqual(resetToken);
    });

    it("should throw unauthorizedException if user is not found", async () => {
      prisma.user.findUnique = jest.fn().mockResolvedValue(null);

      await expect(service.forgetPassword("nonexist@a.com")).rejects.toThrow(
        UnauthorizedException
      );
    });
  });

  describe("resetPassword", () => {
    it("should reset the password if the reset token is valid", async () => {
      const newPassword = "newPassword";
      const resetToken = "validResetToken";
      const hashedPassword = await argon.hash(newPassword);

      prisma.user.findFirst = jest
        .fn()
        .mockResolvedValue({ id: 1, hashedRT: await argon.hash(resetToken) });
      jest.spyOn(argon, "verify").mockResolvedValue(true);
      prisma.user.update = jest.fn().mockResolvedValue({ id: 1 });

      const result = await service.resetPassword(hashedPassword, resetToken);

      expect(result.message).toEqual("Password successfully reset");
    });

    it("should throw UnauthorizedException if the reset token is invalid", async () => {
      const newPassword = "newPassword";
      const resetToken = "invalidResetToken";

      prisma.user.findFirst = jest.fn().mockResolvedValue({
        id: 1,
        hashedRT: await argon.hash("validRestToken"),
      });
      jest.spyOn(argon, "verify").mockResolvedValue(false);

      await expect(
        service.resetPassword(newPassword, resetToken)
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
