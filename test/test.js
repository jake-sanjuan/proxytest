const { assert } = require("chai");
const { upgrades } = require("hardhat");
let test,
  test2,
  test2ProxyAddress,
  testMultipleProxies,
  proxyAdminInstance,
  adminSigner,
  adminSignerAddress,
  otherSigner1,
  otherSigner1Addr,
  otherSigner2,
  otherSigner2Addr,
  testProxyAddress,
  testMultipleProxiesProxyAddress,
  adminAddress;

describe('Proxy tests', () => {

  before(async() => {
    const Test = await ethers.getContractFactory('Test');
    test = await upgrades.deployProxy(Test, [42]);
    await test.deployed();

    const TestMultipleProxies = await ethers.getContractFactory('TestMultipleProxies');
    testMultipleProxies = await upgrades.deployProxy(TestMultipleProxies, [8]);
    await testMultipleProxies.deployed();

    proxyAdminInstance = await upgrades.admin.getInstance();

    adminSigner = ethers.provider.getSigner(0);
    otherSigner1 = ethers.provider.getSigner(1);
    otherSigner2 = ethers.provider.getSigner(2);

    adminSignerAddress = await adminSigner.getAddress();
    otherSigner1Addr = await otherSigner1.getAddress();
    otherSigner2Addr = await otherSigner2.getAddress();

    testProxyAddress = test.address;
    testMultipleProxiesProxyAddress = testMultipleProxies.address;

    adminAddress = proxyAdminInstance.address;
  });

  it('Both proxy coontracts should have the same admin contract', async() => {
    assert.equal(
      await proxyAdminInstance.getProxyAdmin(testProxyAddress),
      await proxyAdminInstance.getProxyAdmin(testMultipleProxiesProxyAddress)
    );
  });

  it('The proxy admin should have the correct signer as an owner', async() => {
    assert.equal(await proxyAdminInstance.owner(), adminSignerAddress);
  });

  it('Should allow the owner to transfer ownership of the ProxyAdmin', async() => {
    await proxyAdminInstance.transferOwnership(otherSigner1Addr);
    assert.equal(
      (await proxyAdminInstance.owner()).toString(), otherSigner1Addr.toString()
    );
    // Transfer back to adminSigner for simplicity of tests
    await (proxyAdminInstance.connect(otherSigner1)).transferOwnership(adminSignerAddress); 
  });

  it(`Should not allow someone other than the owner to change ownership of 
    proxyAdmin contract`, async() => {
    let ex;
    let proxyAdminInstanceOtherSigner = proxyAdminInstance.connect(otherSigner1);
    try {
      await proxyAdminInstanceOtherSigner.transferOwnership(otherSigner2);
    } catch (_ex) {
      ex = _ex;
    }
    assert(ex, 'Should have reverted transaction');
  });

  describe('Test', () => {
    it('should have an initial value of 42', async() => {
      assert.equal(await test.getValue(), 42);
    });

    it('Should have the correct owner for the Test.sol proxy', async() => {
      assert.equal(
        await proxyAdminInstance.getProxyAdmin(testProxyAddress),
        adminAddress
      );
    });
  });

  describe('TestMultipleProxies', () => {
    it('Should have an initial value of 8', async() => {
      assert.equal(await testMultipleProxies.value(), 8);
    });

    it('should multiply the value by 2 to equal 16', async() => {
      await testMultipleProxies.multiplyByTwo();
      assert.equal(await testMultipleProxies.value(), 16);
    });

    it('Should hgave the correct owner for the TestMultipleProxies.sol proxy', async() =>{
      assert.equal(
        await proxyAdminInstance.getProxyAdmin(testMultipleProxiesProxyAddress),
        adminAddress
      );
    });
  });

  describe('Upgrading Test.sol to Test2.sol', () => {
    before(async() => {
      const Test2 = await ethers.getContractFactory('Test2');
      test2 = await upgrades.upgradeProxy(testProxyAddress, Test2);
      await test2.deployed();

      test2ProxyAddress = test2.address;
    });

    it('Should have a value equal to 42', async() => {
      assert.equal(await test2.getValue(), 42);
    });

    it('Should increment the value by 1', async() => {
      await test2.increment()
      assert.equal(await test2.getValue(), 43);
    });

    it('should have the proxyAdmin address as its admin', async() => {
      assert.equal(
        await proxyAdminInstance.getProxyAdmin(test2ProxyAddress),
        adminAddress
      );
    });
  });

  describe('Changing the proxy admin', () => {
    let test2ProxyTx,
      testMultipleProxiesProxyTx;

    before(async() => {
      test2ProxyTx = await proxyAdminInstance.changeProxyAdmin(
        test2ProxyAddress, otherSigner1Addr
      );
      testMultipleProxiesProxyTx = await proxyAdminInstance.changeProxyAdmin(
        testMultipleProxiesProxyAddress,
        otherSigner2Addr
      );
    });

    /**
     * Wanted to do this using events, could not gain access to `AdminChanged()`
     * event through tx.wait()
     */
    it('Should transfer ownership of Test.sol proxy', async() => {
      let ex;
      try {
        // Throws because can only get admin of proxy that proxyAdmin owns
        await proxyAdminInstance.getProxyAdmin(test2ProxyAddress);
      } catch (_ex) {
        ex = _ex;
      }
      assert(ex, 'Should have reverted!');
    });

    it('Should transfer ownership of TestMultipleProxies.sol', async() => {
      let ex;
      try {
        await proxyAdminInstance.getProxyAdmin(testMultipleProxiesProxyAddress);
      } catch (_ex) {
        ex = _ex;
      }
      assert(ex, 'Should have reverted!')
    });
  });
});

/**
 * Can use OZ 3.4 and have same interface for proxyAdmin
 */