const Funds = artifacts.require('Funds')

contract('Funds', (accounts) => {
  describe('given contract is deployed', () => {
    let contract
    let addressStub
    let amountStub

    beforeEach(async () => {
      contract = await Funds.deployed()
      addressStub = accounts[1]
      amountStub = 42
    })

    it('deploys successfully', async () => {
      assert.ok(contract)
    })

    it('when calling for funds, returns default funds amount', async () => {
      const actual = await contract.funds()

      assert.equal(actual, 0, 'Funds amount was not 0')
    })

    describe('given address without permissions', () => {
      let addressWithoutPermissionsStub
      let errorMessageStub

      beforeEach(async () => {
        addressWithoutPermissionsStub = accounts[2]
      })

      it('when calling for permissions, returns false', async () => {
        const actual = await contract.permissions(addressWithoutPermissionsStub)

        assert.isFalse(actual, 'Should be false')
      })

      it('when giving permission, throws', async () => {
        try {
          await contract.givePermission(addressStub, {
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
          await contract.add(amountStub, {
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
          await contract.withdraw(amountStub, {
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
        await contract.givePermission(addressStub, {
          from: addressWithPermissionsStub,
        })

        const actual = await contract.permissions(addressStub)
        assert.isTrue(actual, 'Should be true')
      })

      describe('given clean state', () => {
        beforeEach(async () => {
          contract = await Funds.new()
        })

        it('knows how to add funds', async () => {
          const actual = await contract.add(amountStub, {
            from: addressWithPermissionsStub,
          })
          assert.ok(actual, 'Should know how to add funds')
        })

        it('when some amount is added, updates funds amount correctly', async () => {
          await contract.add(amountStub, { from: addressWithPermissionsStub })

          const actual = await contract.funds()
          assert.equal(actual, amountStub, 'Should be 42')
        })

        it('knows how to withdraw funds', async () => {
          const actual = await contract.withdraw(amountStub, {
            from: addressWithPermissionsStub,
          })

          assert.ok(actual, 'Should know how to withdraw funds')
        })

        it('given some amount is added, when some amount is withdrawn, updates funds amount correctly', async () => {
          await contract.add(amountStub, { from: addressWithPermissionsStub })

          await contract.withdraw(amountStub, {
            from: addressWithPermissionsStub,
          })

          const actual = await contract.funds()
          assert.equal(actual, 0, 'Should be 0')
        })
      })
    })
  })
})
