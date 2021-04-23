const hre = require("hardhat");

async function main() {
  const Test = await hre.ethers.getContractFactory('Test');
  const test = await upgrades.deployProxy(Test, [42]);
  await test.deployed();

  const TestMultipleProxies = await hre.ethers.getContractFactory(
    'TestMultipleProxies'
  );
  const testMultipleProxies = await upgrades.deployProxy(
    TestMultipleProxies, [8]
  );
  await testMultipleProxies.deployed();

  console.log(
    'Test deployed to: ', test.address
  );
  console.log(
    'TestMultipleProxies deployed to: ', testMultipleProxies.address
  );
  console.log(
    'ProxyAdmin deployed to: ',
    (await upgrades.admin.getInstance()).address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
