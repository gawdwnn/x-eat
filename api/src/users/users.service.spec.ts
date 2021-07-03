import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UsersService } from './users.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  delete: jest.fn(),
  findOneOrFail: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(() => 'sign-token-bb'),
  verify: jest.fn(),
});

const mockMailService = () => ({
  sendVerificationEmail: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UsersService;
  let mailService: MailService;
  let jwtService: JwtService;
  let userRepository: MockRepository<User>;
  let verificatonsRepository: MockRepository<Verification>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService(),
        },
        {
          provide: MailService,
          useValue: mockMailService(),
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get(getRepositoryToken(User));
    verificatonsRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', async () => {
    expect(service).toBeDefined();
  });

  describe('create account', () => {
    const createAccountArgs = { email: '', password: '', role: 0 };

    it('should fail if user exist', async () => {
      userRepository.findOne.mockResolvedValue({ id: 1, email: 'testing@mail.com' });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({ ok: false, error: 'Email already exists' });
    });

    it('should create a new user', async () => {
      userRepository.findOne.mockResolvedValue(undefined);
      userRepository.create.mockReturnValue(createAccountArgs);
      userRepository.save.mockResolvedValue(createAccountArgs);
      verificatonsRepository.create.mockReturnValue({ user: createAccountArgs });
      verificatonsRepository.save.mockResolvedValue({ code: 'code' });

      const result = await service.createAccount(createAccountArgs);

      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(createAccountArgs);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(createAccountArgs);
      expect(verificatonsRepository.create).toHaveBeenCalledTimes(1);
      expect(verificatonsRepository.create).toHaveBeenCalledWith({ user: createAccountArgs });
      expect(verificatonsRepository.save).toHaveBeenCalledTimes(1);
      expect(verificatonsRepository.save).toHaveBeenCalledWith({ user: createAccountArgs });
      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(expect.any(String), expect.any(String));
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't create account" });
    });
  });

  describe('login', () => {
    const loginArgs = { email: 'bs@email.com', password: 'bspassword' };

    it('should fail if user deos not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.login(loginArgs);

      expect(result).toEqual({ ok: false, error: 'User not found' });

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));
    });

    it('should fail if password is incorrect', async () => {
      const mockedUser = {
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: 'Incorrect Credentials' });
    });

    it('should return token if password is correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };
      userRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith(expect.any(Number));
      expect(result).toEqual({ ok: true, token: 'sign-token-bb' });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockResolvedValue(new Error());
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, error: "Couldn't login, try again" });
    });
  });

  describe('findById', () => {
    const findByIdArgs = {
      id: 1,
    };

    it('should find an existing user', async () => {
      userRepository.findOneOrFail.mockResolvedValue(findByIdArgs);
      const result = await service.findById(1);
      expect(result).toEqual({ ok: true, user: findByIdArgs });
    });

    it('should fail if no user is found', async () => {
      userRepository.findOneOrFail.mockRejectedValue(new Error());
      const result = await service.findById(1);
      expect(result).toEqual({ ok: false, error: 'User not found' });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        email: 'bs@old.com',
        verified: true,
      };
      const editProfileArgs = {
        userId: 1,
        input: { email: 'bs@new.com' },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        verified: false,
        email: editProfileArgs.input.email,
      };

      userRepository.findOne.mockResolvedValue(oldUser);
      verificatonsRepository.create.mockReturnValue(newVerification);
      verificatonsRepository.save.mockResolvedValue(newVerification);

      await service.editProfile(editProfileArgs.userId, editProfileArgs.input);

      expect(userRepository.findOne).toHaveBeenCalledTimes(1);
      expect(userRepository.findOne).toHaveBeenCalledWith(editProfileArgs.userId);

      expect(verificatonsRepository.create).toHaveBeenCalledWith({ user: newUser });
      expect(verificatonsRepository.save).toHaveBeenCalledWith(newVerification);

      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith(newUser.email, newVerification.code);
    });

    it('should change password', async () => {
      const editProfileArgs = {
        userId: 1,
        input: { password: 'new-password' },
      };
      userRepository.findOne.mockResolvedValue({ password: 'old' });
      const result = await service.editProfile(editProfileArgs.userId, editProfileArgs.input);
      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith(editProfileArgs.input);
      expect(result).toEqual({ ok: true });
    });

    it('should fail on exception', async () => {
      userRepository.findOne.mockRejectedValue(new Error());
      const result = await service.editProfile(1, { email: '12' });
      expect(result).toEqual({ ok: false, error: 'Could not update profile.' });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const mockVerification = {
        id: 1,
        user: { verified: false },
      };

      verificatonsRepository.findOne.mockResolvedValue(mockVerification);

      const result = await service.verifyEmail('');

      expect(verificatonsRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificatonsRepository.findOne).toHaveBeenCalledWith(expect.any(Object), expect.any(Object));

      expect(userRepository.save).toHaveBeenCalledTimes(1);
      expect(userRepository.save).toHaveBeenCalledWith({ verified: true });

      expect(verificatonsRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificatonsRepository.delete).toHaveBeenCalledWith(mockVerification.id);

      expect(result).toEqual({ ok: true });
    });

    it('should fail when verification is not found', async () => {
      verificatonsRepository.findOne.mockResolvedValue(undefined);

      const result = await service.verifyEmail('');

      expect(result).toEqual({ ok: false, error: 'Verification not found' });
    });

    it('should fail on exception', async () => {
      verificatonsRepository.findOne.mockRejectedValue(new Error());

      const result = await service.verifyEmail('');

      expect(result).toEqual({ ok: false, error: 'Could not verify email' });
    });
  });
});
