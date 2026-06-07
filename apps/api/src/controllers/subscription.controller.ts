import { Request, Response, NextFunction } from 'express';
import { Subscription } from '../models/Subscription';
import { PLAN_CONFIGS } from '@nextx/shared';
import { sendSuccess } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

export async function getPlans(_req: Request, res: Response, next: NextFunction) {
  try {
    sendSuccess(res, Object.values(PLAN_CONFIGS));
  } catch (error) {
    next(error);
  }
}

export async function getStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const subscription = await Subscription.findOne({ userId: req.user!.userId });
    if (!subscription) throw ApiError.notFound('Subscription');
    sendSuccess(res, subscription);
  } catch (error) {
    next(error);
  }
}

export async function createCheckout(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Create Stripe Checkout session
    sendSuccess(res, { message: 'Stripe checkout not yet implemented — requires Stripe keys' });
  } catch (error) {
    next(error);
  }
}

export async function createPortal(req: Request, res: Response, next: NextFunction) {
  try {
    // TODO: Create Stripe Customer Portal session
    sendSuccess(res, { message: 'Stripe portal not yet implemented — requires Stripe keys' });
  } catch (error) {
    next(error);
  }
}
