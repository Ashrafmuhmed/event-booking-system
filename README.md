# Event Booking System

A Node.js backend API for managing events, user authentication, and event reservations. This system handles transactions, background job processing, real-time capacity management, and API rate limiting for secure event booking platforms.

## Overview

The Event Booking System is a backend API that manages:

- **User Management**: Registration, authentication, and profile management with role-based access control (organizer/user roles)
- **Reservation System**: Handle multiple reservations per user with quantity-based bookings and automatic capacity updates
- **Real-time Updates**: ACID transactions with database locks ensure accurate capacity management even with concurrent bookings
- **Email Notifications**: Asynchronous confirmation emails using SendGrid and BullMQ background job processing
- **Secure Authentication**: JWT-based token authentication with password hashing using bcrypt
- **API Security**: Rate limiting on all endpoints to prevent abuse and ensure fair resource usage

---

### Key Features

- **Transaction-based Reservations** - When multiple users book simultaneously, the system uses database transactions and row-level locks to prevent overbooking
- **Real-time Capacity Management** - Automatic tracking and updating of available spots at events with atomic operations
- **Role-based Access Control** - Separate permissions for event organizers and regular users with middleware enforcement
- **Asynchronous Email Processing** - Background worker jobs send confirmation emails without blocking API responses using BullMQ and Redis
- **API Rate Limiting** - Prevents brute force attacks and API abuse with tiered rate limits per endpoint type
- **Secure Authentication** - JWT-based token authentication with password hashing using bcrypt
- **Password Recovery** - Email-based password reset functionality with time-expiring tokens

---

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcrypt
- **Background Jobs**: BullMQ + Redis
- **Email Service**: SendGrid
- **Rate Limiting**: express-rate-limit

---

## Reservation Flow with Transaction Safety

1. User requests reservation with event ID and quantity
2. Database transaction begins
3. Event row is locked (UPDATE lock) to prevent concurrent modifications
4. System checks if available capacity >= requested quantity
5. If valid:
   - Available capacity is decremented
   - Check if user already has a reservation for this event
   - If exists: increment quantity on existing reservation
   - If new: create new reservation record
   - Event is updated in transaction
   - Confirmation email job is queued asynchronously
6. Transaction commits atomically
7. Response sent to user immediately
8. Background worker processes email confirmation job

This ensures zero possibility of overbooking even with thousands of concurrent requests.

---

## System Flow

<img width="764" height="737" alt="Screenshot 2026-02-13 055136" src="https://github.com/user-attachments/assets/be3d02c9-5f54-44d9-8e2a-06d37f67cd33" />
