# enidaan-server

- [enidaan-server](#enidaan-server)
  - [Problem Statement](#problem-statement)
  - [Introduction](#introduction)
  - [Purpose](#purpose)
  - [Scope](#scope)
  - [Methodology](#methodology)
  - [Instructions](#instructions)
  - [Endpoints](#endpoints)
  - [Acknowledgments](#acknowledgments)

## Problem Statement

The state of the medical industry is such that hospitals are king and decide the final pricing of most medical services. They often take a big cut from all transactions which often adds up to exorbitant fees for patients. We seek to resolve this issue in two ways, ie, using ML Models where possible to avoid having to consult an expert and deal with the fees associated with that and when that’s not possible we will cut out the middle man (hospitals) so that the overall cost to the patient is minimal.

## Introduction

Our project intends to alleviate a small part of the problem and allow users to get reports based on their medical scans for a minimal cost. The users will get their diagnosis within seconds and they can have the option of confirming it with a doctor as well. The user will have to upload the MRI scan and the other test details depending on the number of diseases he wants to check as a part of the diagnosis. They will have the option to check their medical scans and tests for all the major lung problems and get their diagnosis accordingly.

## Purpose

Usually people have to spend loads of money, visit several doctors and get a hundred different tests before their disease is diagnosed, let alone treated. To make early and easy diagnosis accessible to all, we at ‘E-Nidaan’ aim to provide an online platform where people can answer a simple questionnaire and upload their X-ray or MRI scan.The ML model detects the disease and then the person can take a second opinion from the doctors registered on our platform.
Easy and quick, cost-effective diagnosis is the solution we offer for lung diseases.
It helps to avoid misdiagnosis and utilizes the power of machine learning for managing respiratory diseases. We believe this will revolutionize diagnosis and treatment especially in low resource areas.

## Scope

The initial product will serve as a proof of concept and will only focus on diseases related to the lungs. We plan on eventually increasing the scope and allowing users to get a quick and reliable opinion on any scans that they might have taken, not just lungs.
It’s also our intention to market ourselves as a platform where doctors can quickly and easily make a reliable side business with minimal effort.

## Methodology

Searching for various medical datasets pertaining to lung diseases on sites such as Kaggle. Followed by applying various Machine learning and Deep learning models and doing hyperparameter tuning in order to maximize the metrics.
We will also give users an option to get a second opinion from a doctor within our platform for a minimal fee. Users would be able to view the rating of various doctors so that they can make an informed decision.

## Instructions

1. Ensure that yarn is installed locally.
2. Clone repo and cd into cloned folder.
3. Install packages using `yarn` or `yarn install`.
4. Run development server using `yarn dev`.

## Endpoints
1. POST /user/signup
   - Body
      ```js
      {
        email: string,
        password: string,
        confirmPassword: string,
        gender: M|F,
        name: string,
        location: string
      }
      ```
    - Response: On success returns created user fields.
2. POST /user/login
   - Body
      ```js
      {
        email: string,
        password: string
      }
      ```
   - Response: Set-Cookie field in header contains cookie used for session.
3. GET /user/logout
   - Response: Status success on successfully logging out. Session cookie will now no longer work.
4. GET /user/account
   - Response: Returns user profile (name, gender, location).
5. POST /user/account/profile
   - Body
      ```js
      {
        email: string,
        name: string,
        gender: string,
        location: string
      }
      ```
   - Response: Returns new user profile (name, gender, location).
6. POST /user/account/password
7. POST /user/account/delete
   - Response: Success message if user is successfully deleted.
## Acknowledgments

Repo based off of [NodeJS Hackathon Starter](https://github.com/sahat/hackathon-starter).
