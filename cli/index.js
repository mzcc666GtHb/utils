#!/usr/bin/env node
const program = require('commander')
const shell = require('shelljs')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const fs = require('fs')
const gitClone = require('git-clone-promise')
const symbols = require('log-symbols')
const ora = require('ora');
const spinner = ora('Loading...');
spinner.color = 'green';
program
    .version(require('./package').version, '-v, --version')
    .command('create [projectName]')
    .alias('c')
    .option('-r, --remote [remote]', '克隆远程仓库,参数为远程仓库名', param => {
        return param
    })
    .action((projectName, options) => {
        if (!(projectName && typeof projectName === 'string')) {
            console.log(symbols.error, chalk.redBright('请填写项目名称'))
            return
        }
        if (!fs.existsSync(projectName)) {

            const prompts = [
                    {
                        name: 'description',
                        message: 'description'
                    },
                    {
                        name: 'author',
                        message: 'author'
                    }
                ],
                existing = {
                    type: "rawlist",
                    message: "select a template that you want to create",
                    name: "platform",
                    //对应远程仓库名
                    choices: [
                        {
                            name: "vue-admin"
                        },
                        {
                            name: "vue-h5"
                        },
                        {
                            name: "vue-base"
                        }
                    ]
                },
                {remote} = options
            if (!remote) {
                prompts.unshift(existing)
            }
            //问询
            inquirer.prompt(prompts).then((answers) => {
                const {platform} = answers,
                    repoName = remote ? remote : platform,
                    //git 地址
                    repo = `http:xxxxxxxx${repoName}.git`,
                    pwd = shell.pwd(),
                    localpath = path.join(pwd.toString(), projectName)

                spinner.start()
                gitClone(repo, localpath).then(() => {
                    shell.rm('-rf', path.join(localpath, '.git'))
                    try {
                        const meta = {
                                name: projectName,
                                description: answers.description,
                                author: answers.author
                            },
                            packageFileName = `${projectName}/package.json`,
                            packageContent = JSON.parse(fs.readFileSync(packageFileName).toString()),
                            packageResult = JSON.stringify(Object.assign(packageContent, meta), "", "\t")
                        fs.writeFileSync(packageFileName, packageResult)
                    } catch (err) {

                    }
                    spinner.succeed()
                    console.log(symbols.success, chalk.green('模板初始化完成'))
                }).catch(err => {
                    spinner.fail()
                    console.log(symbols.error, chalk.redBright(err + '  请检查有无权限'))
                })
            })
        } else {
            console.log(symbols.error, chalk.redBright('项目已存在'))
        }
    })
    .on('--help', () => {
        console.log(chalk.yellow('例如:创建一个名为test的项目'))
        console.log(chalk.yellow('mfg create test  或者 mfg c test'))
    })
program.parse(process.argv)
