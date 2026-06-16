export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NextX API Documentation',
    version: '1.0.0',
    description: 'API endpoints for NextX - the EHCP Journey Companion application.',
  },
  servers: [
    {
      url: 'http://localhost:4000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['user', 'admin'] },
          profile: {
            type: 'object',
            properties: {
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              avatarUrl: { type: 'string', nullable: true },
              phone: { type: 'string', nullable: true },
            },
          },
          preferences: {
            type: 'object',
            properties: {
              emailNotifications: { type: 'boolean' },
              reminderEmails: { type: 'boolean' },
              weeklyDigest: { type: 'boolean' },
            },
          },
          emailVerified: { type: 'boolean' },
        },
      },
      Child: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          dateOfBirth: { type: 'string', format: 'date' },
          school: { type: 'string' },
          localAuthority: { type: 'string' },
          ehcpStage: { type: 'string' },
          notes: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Folder: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          childId: { type: 'string', nullable: true },
          name: { type: 'string' },
          parentFolderId: { type: 'string', nullable: true },
          color: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Document: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          userId: { type: 'string' },
          childId: { type: 'string', nullable: true },
          folderId: { type: 'string', nullable: true },
          source: { type: 'string', enum: ['upload', 'ai_generated'] },
          name: { type: 'string' },
          originalName: { type: 'string' },
          mimeType: { type: 'string' },
          sizeBytes: { type: 'integer' },
          firebasePath: { type: 'string' },
          filePath: { type: 'string' },
          fileUrl: { type: 'string' },
          downloadUrl: { type: 'string', nullable: true },
          tags: { type: 'array', items: { type: 'string' } },
          description: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {
    '/api/auth/signup': {
      post: {
        summary: 'Register a new user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'firstName', 'lastName'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User created' },
          400: { description: 'Bad request / validation error' },
          409: { description: 'Email already exists' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        summary: 'Log in a user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        accessToken: { type: 'string' },
                        refreshToken: { type: 'string' },
                        user: { $ref: '#/components/schemas/User' },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: 'Invalid email or password' },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['refreshToken'],
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Tokens rotated successfully' },
          401: { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/auth/google': {
      post: {
        summary: 'Log in or Register via Google',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['idToken'],
                properties: {
                  idToken: { type: 'string', description: 'JWT token from Google OAuth provider' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          400: { description: 'Bad request / Invalid token' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        summary: 'Log out a user',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  refreshToken: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/auth/forgot-password': {
      post: {
        summary: 'Request a password reset email',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email'],
                properties: {
                  email: { type: 'string', format: 'email' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Reset link sent' },
        },
      },
    },
    '/api/auth/reset-password': {
      post: {
        summary: 'Reset password using a token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['token', 'password'],
                properties: {
                  token: { type: 'string' },
                  password: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password reset successfully' },
          400: { description: 'Invalid or expired token' },
        },
      },
    },
    '/api/auth/verify-email/{token}': {
      get: {
        summary: 'Verify user email address',
        tags: ['Authentication'],
        parameters: [{ name: 'token', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Email verified successfully' },
          400: { description: 'Invalid verification token' },
        },
      },
    },
    '/api/users/me': {
      get: {
        summary: 'Get current user profile',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Profile details returned' },
          401: { description: 'Unauthorized' },
        },
      },
      patch: {
        summary: 'Update current user profile',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  phone: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Profile updated' },
          401: { description: 'Unauthorized' },
        },
      },
      delete: {
        summary: 'Delete current user account',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Account deleted successfully' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/users/me/password': {
      patch: {
        summary: 'Change user password',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['currentPassword', 'newPassword', 'confirmPassword'],
                properties: {
                  currentPassword: { type: 'string' },
                  newPassword: { type: 'string', minLength: 8 },
                  confirmPassword: { type: 'string', minLength: 8 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Password changed successfully' },
          400: { description: 'Invalid current password' },
        },
      },
    },
    '/api/users/me/avatar': {
      patch: {
        summary: 'Upload user avatar image',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Avatar uploaded' },
          400: { description: 'Bad request' },
        },
      },
    },
    '/api/users/me/preferences': {
      patch: {
        summary: 'Update notification preferences',
        tags: ['User Profile'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  emailNotifications: { type: 'boolean' },
                  reminderEmails: { type: 'boolean' },
                  weeklyDigest: { type: 'boolean' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Preferences updated' },
          400: { description: 'Bad request' },
        },
      },
    },
    '/api/children': {
      get: {
        summary: 'List user\'s children',
        tags: ['Children CRUD'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of children profiles',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'array',
                      items: { $ref: '#/components/schemas/Child' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Add a child profile',
        tags: ['Children CRUD'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['firstName', 'lastName', 'dateOfBirth', 'school', 'localAuthority', 'ehcpStage'],
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  dateOfBirth: { type: 'string', format: 'date', description: 'YYYY-MM-DD' },
                  school: { type: 'string' },
                  localAuthority: { type: 'string' },
                  ehcpStage: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Child profile added' },
          400: { description: 'Validation error' },
        },
      },
    },
    '/api/children/{id}': {
      get: {
        summary: 'Get child details',
        tags: ['Children CRUD'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Child details' },
          404: { description: 'Child profile not found' },
        },
      },
      patch: {
        summary: 'Update child details',
        tags: ['Children CRUD'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  firstName: { type: 'string' },
                  lastName: { type: 'string' },
                  school: { type: 'string' },
                  localAuthority: { type: 'string' },
                  ehcpStage: { type: 'string' },
                  notes: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Child updated' },
        },
      },
      delete: {
        summary: 'Delete child profile',
        tags: ['Children CRUD'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Child deleted' },
        },
      },
    },
    '/api/folders': {
      get: {
        summary: 'List user\'s folders',
        tags: ['Folders'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'List of folders' },
        },
      },
      post: {
        summary: 'Create a new folder',
        tags: ['Folders'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name'],
                properties: {
                  name: { type: 'string' },
                  color: { type: 'string', description: 'Hex color string (e.g. #ff0000)' },
                  childId: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Folder created' },
        },
      },
    },
    '/api/folders/{id}': {
      patch: {
        summary: 'Rename or edit a folder',
        tags: ['Folders'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  color: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Folder updated' },
        },
      },
      delete: {
        summary: 'Delete a folder',
        tags: ['Folders'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          240: { description: 'Folder deleted successfully' },
        },
      },
    },
    '/api/documents': {
      get: {
        summary: 'List documents (filterable)',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'folderId', in: 'query', schema: { type: 'string' } },
          { name: 'childId', in: 'query', schema: { type: 'string' } },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
        ],
        responses: {
          200: { description: 'List of documents' },
        },
      },
    },
    '/api/documents/upload': {
      post: {
        summary: 'Upload a document',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file'],
                properties: {
                  file: { type: 'string', format: 'binary', description: 'Upload file buffer' },
                  name: { type: 'string', description: 'Custom document name' },
                  folderId: { type: 'string' },
                  childId: { type: 'string' },
                  tags: { type: 'string', description: 'Comma separated tags' },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Document uploaded' },
        },
      },
    },
    '/api/documents/{id}': {
      get: {
        summary: 'Get document details',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Document schema' },
        },
      },
      patch: {
        summary: 'Update document metadata',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  folderId: { type: 'string' },
                  tags: { type: 'array', items: { type: 'string' } },
                  description: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Document updated' },
        },
      },
      delete: {
        summary: 'Delete document',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          204: { description: 'Document deleted' },
        },
      },
    },
    '/api/documents/{id}/download': {
      get: {
        summary: 'Get signed download url',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'URL generated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: {
                      type: 'object',
                      properties: {
                        downloadUrl: { type: 'string' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/documents/search': {
      get: {
        summary: 'Search documents by text',
        tags: ['Documents'],
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
        responses: {
          200: { description: 'Search results' },
        },
      },
    },
  },
};
