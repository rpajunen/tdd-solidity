const Funds = artifacts.require('Funds')

contract('Funds', (accounts) => {
  describe('given contract is deployed', () => {
    let contract

    beforeEach(async () => {
      contract = await Funds.new()
    })

    it('deploys successfully', async () => {
      assert.ok(contract)
    })

    it('when calling for funds, returns default funds amount', async () => {
      const actual = await contract.funds()

      assert.equal(actual, 0, 'Funds amount was not 0')
    })

    describe('given stubbed values', () => {
      let someAddressStub
      let someAmountStub

      beforeEach(async () => {
        someAddressStub = accounts[1]
        someAmountStub = 42
      })

      describe('given address without permissions', () => {
        let addressWithoutPermissionsStub
        let errorMessageStub

        beforeEach(async () => {
          addressWithoutPermissionsStub = accounts[2]
        })

        it('when calling for permissions, returns false', async () => {
          const actual = await contract.permissions(
            addressWithoutPermissionsStub
          )

          assert.isFalse(actual, 'Should be false')
        })

        it('when giving permission, throws', async () => {
          try {
            await contract.givePermission(someAddressStub, {
              from: addressWithoutPermissionsStub,
            })
          } catch (error) {
            errorMessageStub = error.reason
          } finally {
            assert(
              errorMessageStub === 'Permission required to grant permission',
              'Did not throw error "Permission required to grant permission"'
            )
          }
        })

        it('when calling add function, throws', async () => {
          try {
            await contract.add(someAmountStub, {
              from: addressWithoutPermissionsStub,
            })
          } catch (error) {
            errorMessageStub = error.reason
          } finally {
            assert(
              errorMessageStub === 'Permission required to add funds',
              'Did not throw error "Permission required to add funds"'
            )
          }
        })

        it('when calling withdraw function, throws', async () => {
          try {
            await contract.withdraw(someAddressStub, {
              from: addressWithoutPermissionsStub,
            })
          } catch (error) {
            errorMessageStub = error.reason
          } finally {
            assert(
              errorMessageStub === 'Permission required to withdraw funds',
              'Did not throw error "Permission required to withdraw funds"'
            )
          }
        })
      })

      describe('given address with permissions', () => {
        let addressWithPermissionsStub

        beforeEach(async () => {
          addressWithPermissionsStub = accounts[0]
        })

        it('when calling for permissions, returns true', async () => {
          const actual = await contract.permissions(addressWithPermissionsStub)

          assert.isTrue(actual, 'Should be true')
        })

        it('when giving permission to an account, updates permissions correctly', async () => {
          await contract.givePermission(someAddressStub, {
            from: addressWithPermissionsStub,
          })

          const actual = await contract.permissions(someAddressStub)
          assert.isTrue(actual, 'Should be true')
        })

        it('knows how to add funds', async () => {
          const actual = await contract.add(someAmountStub, {
            from: addressWithPermissionsStub,
          })

          assert.ok(actual, 'Should know how to add funds')
        })

        it('knows how to withdraw funds', async () => {
          const actual = await contract.withdraw(someAmountStub, {
            from: addressWithPermissionsStub,
          })

          assert.ok(actual, 'Should know how to withdraw funds')
        })

        it('when some amount is added, updates funds amount correctly', async () => {
          await contract.add(someAmountStub, {
            from: addressWithPermissionsStub,
          })

          const actual = await contract.funds()
          assert.equal(actual, someAmountStub, 'Should be 42')
        })

        it('given some amount is added, when some amount is withdrawn, updates funds amount correctly', async () => {
          await contract.add(someAmountStub, {
            from: addressWithPermissionsStub,
          })

          await contract.withdraw(someAmountStub, {
            from: addressWithPermissionsStub,
          })

          const actual = await contract.funds()
          assert.equal(actual, 0, 'Should be 0')
        })
      })
    })
  })
})
