import { CONTACT_EMAIL } from 'back-end/config';
import * as db from 'back-end/lib/db';
import { Emails } from 'back-end/lib/mailer';
import * as templates from 'back-end/lib/mailer/templates';
import { makeSend } from 'back-end/lib/mailer/transport';
import { unionBy } from 'lodash';
import React from 'react';
import { formatAmount, formatDate, formatTime } from 'shared/lib';
import { CWUOpportunity } from 'shared/lib/resources/opportunity/code-with-us';
import { User } from 'shared/lib/resources/user';
import { getValidValue } from 'shared/lib/validation';

export async function handleCWUPublished(connection: db.Connection, opportunity: CWUOpportunity): Promise<void> {
  // Notify all users with notifications turned on
  const subscribedUsers = getValidValue(await db.readManyUsersNotificationsOn(connection), null) || [];
  await Promise.all(subscribedUsers.map(async user => await newCWUOpportunityPublished(user, opportunity)));

  // Notify authoring gov user of successful publish
  if (opportunity.createdBy) {
    const author = getValidValue(await db.readOneUser(connection, opportunity.createdBy.id), null);
    if (author) {
      await successfulCWUPublication(author, opportunity);
    }
  }
}

export async function handleCWUUpdated(connection: db.Connection, opportunity: CWUOpportunity): Promise<void> {
  // Notify all subscribed users on this opportunity, as well as users with proposals (we union so we don't notify anyone twice)
  const subscribedUsers = getValidValue(await db.readManyCWUSubscribedUsers(connection, opportunity.id), null) || [];
  const usersWithProposals = getValidValue(await db.readManyCWUProposalAuthors(connection, opportunity.id), null) || [];
  const unionedUsers = unionBy(subscribedUsers, usersWithProposals, 'id');
  await Promise.all(unionedUsers.map(async user => await updatedCWUOpportunity(user, opportunity)));
}

export async function handleCWUCancelled(connection: db.Connection, opportunity: CWUOpportunity): Promise<void> {
  // Notify all subscribed users on this opportunity, as well as users with proposals (we union so we don't notify anyone twice)
  const subscribedUsers = getValidValue(await db.readManyCWUSubscribedUsers(connection, opportunity.id), null) || [];
  const usersWithProposals = getValidValue(await db.readManyCWUProposalAuthors(connection, opportunity.id), null) || [];
  const unionedUsers = unionBy(subscribedUsers, usersWithProposals, 'id');
  await Promise.all(unionedUsers.map(async user => await cancelledCWUOpportunitySubscribed(user, opportunity)));

  // Notify gov user that opportunity is cancelled
  const author = opportunity.createdBy && getValidValue(await db.readOneUser(connection, opportunity.createdBy.id), null);
  if (author) {
    await cancelledCWUOpportunityActioned(author, opportunity);
  }
}

export async function handleCWUSuspended(connection: db.Connection, opportunity: CWUOpportunity): Promise<void> {
  // Notify all subscribed users on this opportunity, as well as users with proposals (we union so we don't notify anyone twice)
  const subscribedUsers = getValidValue(await db.readManyCWUSubscribedUsers(connection, opportunity.id), null) || [];
  const usersWithProposals = getValidValue(await db.readManyCWUProposalAuthors(connection, opportunity.id), null) || [];
  const unionedUsers = unionBy(subscribedUsers, usersWithProposals, 'id');
  await Promise.all(unionedUsers.map(async user => await suspendedCWUOpportunitySubscribed(user, opportunity)));

  // Notify gov user that opportunity is suspended
  const author = opportunity.createdBy && getValidValue(await db.readOneUser(connection, opportunity.createdBy.id), null);
  if (author) {
    await suspendedCWUOpportunityActioned(author, opportunity);
  }
}

export async function handleCWUReadyForEvaluation(connection: db.Connection, opportunity: CWUOpportunity): Promise<void> {
  // Notify gov user that the opportunity is ready
  const author = opportunity.createdBy && getValidValue(await db.readOneUser(connection, opportunity.createdBy.id), null) || null;
  if (author) {
    await readyForEvalCWUOpportunity(author, opportunity);
  }
}

export const newCWUOpportunityPublished = makeSend(newCWUOpportunityPublishedT);

export async function newCWUOpportunityPublishedT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = 'A New Code With Us Opportunity Has Been Posted';
  return [{
    to: recipient.email,
    subject: title,
    html: templates.simple({
      title,
      description: 'A new opportunity has been posted to the Digital Marketplace:',
      descriptionLists: [makeCWUOpportunityInformation(opportunity)],
      callsToAction: [viewCWUOpportunityCallToAction(opportunity)]
    })
  }];
}

export const successfulCWUPublication = makeSend(successfulCWUPublicationT);

export async function successfulCWUPublicationT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = 'Your Code With Us Opportunity Has Been Posted'; // Used for subject line and heading
  const description = 'You have successfully posted the following Digital Marketplace opportunity';
  return [{
    to: recipient.email,
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity)],
      body: (
        <div>
          <p style={{...templates.styles.utilities.font.italic}}>What Happens Next?</p>
          <p>Sit back and relax as Vendors submit proposals to your opportunity. You will not be able to view these proposals until the opportunity has reached its closing date and time.</p>
          <p>Once the opportunity has closed, you will be notified that the proposal submissions are ready for your review.</p>
          <p>If you would like to make a change to your opportunity, such as adding an addendum, simply <templates.Link text='sign in' url={templates.makeUrl('sign-in')} /> and access the opportunity via your dashboard. </p>
        </div>
      ),
      callsToAction: [viewCWUOpportunityCallToAction(opportunity, true)]
    })
  }];
}

export const updatedCWUOpportunity = makeSend(updatedCWUOpportunityT);

export async function updatedCWUOpportunityT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = 'A Code With Us Opportunity Has Been Updated';
  const description = 'The following Digital Marketplace opportunity has been updated:';
  return[{
    to: recipient.email,
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity)],
      callsToAction: [viewCWUOpportunityCallToAction(opportunity)]
    })
  }];
}

export const cancelledCWUOpportunitySubscribed = makeSend(cancelledCWUOpportunitySubscribedT);

export async function cancelledCWUOpportunitySubscribedT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = 'A Code With Us Opportunity Has Been Cancelled';
  const description = 'The following Digital Marketplace opportunity has been cancelled:';
  return [{
    to: recipient.email,
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity)],
      body: (
        <div>
          <p>If you have any questions, please send an email to {CONTACT_EMAIL}.</p>
        </div>
      )
    })
  }];
}

export const cancelledCWUOpportunityActioned = makeSend(cancelledCWUOpportunityActionedT);

export async function cancelledCWUOpportunityActionedT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = 'A Code With Us Opportunity Has Been Cancelled';
  const description = 'You have cancelled the following opportunity on the Digital Marketplace:';
  return[{
    to: recipient.email,
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity)]
    })
  }];
}

export const suspendedCWUOpportunitySubscribed = makeSend(suspendedCWUOpportunitySubscribedT);

export async function suspendedCWUOpportunitySubscribedT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = 'A Code With Us Opportunity Has Been Suspended';
  const description = 'The following Digital Marketplace opportunity has been suspended:';
  return [{
    to: recipient.email,
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity)],
      body: (
        <div>
          <p>If you have already submitted a proposal to this opportunity, you may make changes to it while the opportunity is suspended.</p>
          <p>If you have any questions, please send an email to {CONTACT_EMAIL}.</p>
        </div>
      )
    })
  }];
}

export const suspendedCWUOpportunityActioned = makeSend(suspendedCWUOpportunityActionedT);

export async function suspendedCWUOpportunityActionedT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = 'A Code With Us Opportunity Has Been Suspended';
  const description = 'You have suspended the following opportunity on the Digital Marketplace:';
  return[{
    to: recipient.email,
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity)]
    })
  }];
}

export const readyForEvalCWUOpportunity = makeSend(readyForEvalCWUOpportunityT);

export async function readyForEvalCWUOpportunityT(recipient: User, opportunity: CWUOpportunity): Promise<Emails> {
  const title = 'Your Code With Us Opportunity is Ready to Be Evaluated';
  const description = 'Your Digital Marketplace opportunity has reached its proposal deadline.';
  return[{
    to: recipient.email,
    subject: title,
    html: templates.simple({
      title,
      description,
      descriptionLists: [makeCWUOpportunityInformation(opportunity)],
      body: (
        <div>
          <p>You may now view proposals submitted by Vendors and assign scores to each submission.</p>
        </div>
      ),
      callsToAction: [viewCWUOpportunityCallToAction(opportunity, true)]
    })
  }];
}

export function makeCWUOpportunityInformation(opportunity: CWUOpportunity): templates.DescriptionListProps {
  const items = [
    { name: 'Type', value: 'Code With Us' },
    { name: 'Value', value: `$${formatAmount(opportunity.reward)}` },
    { name: 'Location', value: opportunity.location },
    { name: 'Remote OK?', value: opportunity.remoteOk ? 'Yes' : 'No' },
    { name: 'Proposals Due', value: `${formatDate(opportunity.proposalDeadline, false)} at ${formatTime(opportunity.proposalDeadline, true)}` }
  ];
  return {
    title: opportunity.title,
    items
  };
}

export function viewCWUOpportunityCallToAction(opportunity: CWUOpportunity, authenticatedView = false): templates.LinkProps {
  return {
    text: 'View Opportunity',
    url: authenticatedView ? templates.makeUrl(`sign-in?redirectOnSuccess=${encodeURIComponent(`/opportunities/code-with-us/${opportunity.id}`)}`) : templates.makeUrl(`opportunities/code-with-us/${opportunity.id}`)
  };
}